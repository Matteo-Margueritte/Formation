defmodule Server.Router do
  use Plug.Router

  plug Plug.Static, from: "lib/priv/static", at: "/static"

  plug :match
  plug(Plug.Parsers, parsers: [:json], json_decoder: Poison)
  plug :dispatch

  get "/api/order/:remoteid" do
    {status, body} = Server.Database.search(Server.Database, Map.to_list(conn.params))
                     |> case do
                          [result]-> {200, Poison.encode!(result)}
                          _ -> {404, Poison.encode!(%{"code" => 404, "message" => "Not result found"})}
                        end
    send_resp(conn, status, body)
  end

  delete "/api/order/:remoteid" do
    :timer.sleep(3000)
    GenServer.cast(Server.Database, {:delete, remoteid}) |> IO.inspect
    send_resp(conn, 204, Poison.encode!(%{"code" => 204, "message" => "Order #{:remoteid} successfully deleted"}))
  end

  get "/api/orders" do
    %{"page" => page} = conn.params
    body = GenServer.call(Server.Database, {:page, 10, String.to_integer(page) * 10})
           |> Poison.encode!
    send_resp(conn, 200, body)
  end

  get "/me" do
    send_resp(conn, 200, "I am The First, The One, Le Geant Plug Vert, Le Grand Plug, Le Plug Cosmique.")
  end

  get _, do: send_file(conn, 200, "lib/priv/static/index.html")
end
