defmodule Server.Router do
  use Plug.Router

  plug Plug.Static, from: "lib/priv/static", at: "/static"

  plug :match
  plug(Plug.Parsers, parsers: [:json], json_decoder: Poison)
  plug :dispatch

  get "/api/order/:remoteid" do
    {_,{_,_,body}} = Server.Riak.get_object("orders", remoteid)
    send_resp(conn, 200, Poison.encode!(Poison.decode!(body)))
  end

  delete "/api/order/:remoteid" do
    :timer.sleep(3000)
    Server.Riak.delete_object("orders", remoteid)
    send_resp(conn, 204, Poison.encode!(%{"code" => 204, "message" => "Order #{:remoteid} successfully deleted"}))
  end

  @defaults %{"page" => "1", "rows" => "30", "sort" => "creation_date_index"}
  get "/api/orders" do
    %{"page" => page, "rows" => rows, "q" => query, "sort" => sort} = Map.merge(@defaults, conn.params)
    case Server.Riak.search("orders", query, page, rows, sort) do
      {:ok, body} ->
        res = Task.async_stream(body["response"]["docs"], &Server.Riak.get_json_object/1, max_concurrency: 10)
              |> Enum.reduce([], fn {:ok, order}, acc -> [order | acc] end)
        send_resp(conn, 200, Poison.encode!(%{"numFound" => body["response"]["numFound"], "orders" => res}))
      {:error, _} -> send_resp(conn, 200, Poison.encode!(%{"numFound" => 0, "orders" => []}))
    end
  end

  get "/me" do
    send_resp(conn, 200, "I am The First, The One, Le Geant Plug Vert, Le Grand Plug, Le Plug Cosmique.")
  end

  get _, do: send_file(conn, 200, "lib/priv/static/index.html")
end
