defmodule Server.Router do
  use Plug.Router

  plug Plug.Static, from: "lib/priv/static", at: "/static"

  plug :match
  plug(Plug.Parsers, parsers: [:json], json_decoder: Poison)
  plug :dispatch

  get "/search" do
    IO.inspect Map.to_list(conn.params)
    {status, body} = Server.Database.search(Server.Database, Map.to_list(conn.params))
                     |> IO.inspect
                     |> case do
                          [result]-> case Poison.encode(result) do
                                    {:ok, res} -> {200, res}
                                    _ -> {500, "Une erreur est survenue"}
                                  end
                          _ -> {404, "No result found"}
                        end
    send_resp(conn, status, body)
  end

  get "/me" do
    send_resp(conn, 200, "I am The First, The One, Le Geant Plug Vert, Le Grand Plug, Le Plug Cosmique.")
  end

  get _, do: send_file(conn, 200, "lib/priv/static/index.html")

  #  match _ do
  #    send_resp(conn, 404, "Go away you are not welcome here")
  #end

##  Server with custom plug router

   # use Server.TheCreator

   # my_get "/hello" do
   #   {200, "Ok"}
   # end

   # my_get "/" do
   #   {200, "Home"}
   # end

   # my_error code: 400, content: "Custom error message"

end
