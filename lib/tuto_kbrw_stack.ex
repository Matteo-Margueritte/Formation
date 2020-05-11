defmodule KbrwStack do
  use Application

  # See http://elixir-lang.org/docs/stable/elixir/Application.html
  # for more information on OTP Applications
  def start(_type, _args) do
    {:ok, super_pid} = Server.Supervisor.start_link
    Supervisor.which_children(super_pid) |> IO.inspect
#    [{_, child_pid, _, _}] = Supervisor.which_children(super_pid)

    #Enum.map(Path.wildcard("./orders_dump/*"), fn file -> JsonLoader.load_to_database(Server.Database, file)end)
    orders = [
      %{"id" => "toto", "key" => 42},
      %{"id" => "test", "key" => "42"},
      %{"id" => "tata", "key" => "Apero?"},
      %{"id" => "kbrw", "key" => "Oh yeah"},
    ]
    Enum.map(orders, fn order -> GenServer.call(Server.Database, {:create, order["key"], order}) end)
    Server.Database.search(Server.Database, [{"key", "42"}, {"key", 42}]) |> IO.inspect
    Server.Database.search(Server.Database, [{"id", "52"}, {"id", "this is a test"}]) |> IO.inspect
    {:ok, super_pid}
  end

end
