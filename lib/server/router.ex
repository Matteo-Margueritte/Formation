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

  get "/api/orders" do
    %{"page" => page} = conn.params |> IO.inspect
    body = GenServer.call(Server.Database, {:page, 10, String.to_integer(conn.params["page"]) * 10})
                     |> Poison.encode!
#                     |> case do
#                          result -> Poison.encode!(result)
#                                    |> case do
#                                         {:ok, res} -> {200, res}
#                                         {_, msg} -> IO.inspect(msg)
#                                       end
#                          _ -> {404, Poison.encode!(%{"code" => 404, "message" => "Not result found"})} |> IO.inspect
#                        end
    send_resp(conn, 200, body)
  end

  get "/me" do
    send_resp(conn, 200, "I am The First, The One, Le Geant Plug Vert, Le Grand Plug, Le Plug Cosmique.")
  end

  get _, do: send_file(conn, 200, "lib/priv/static/index.html")
end
