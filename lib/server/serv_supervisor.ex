defmodule Server.Supervisor do
  use Supervisor

  def start_link do
    Supervisor.start_link(__MODULE__, [], name: __MODULE__)
  end

  def init([]) do
    children = [
      Plug.Adapters.Cowboy.child_spec(:http,Server.FullApi,[], port: 4001),
      #Plug.Adapters.Cowboy.child_spec(:http, Server.Router, [], [port: 4001]),
      #worker(Server.Database, [:ok])
    ]
    supervise(children, strategy: :one_for_one)
  end

  def handle_order(order, action) do
    spec = worker(OrderHandler, [order], [id: order["id"], restart: :temporary])
    {:ok, pid} = Supervisor.start_child(__MODULE__, spec)
    res = GenServer.call(pid, {:transition, action})
    GenServer.stop(pid)
    res
  end

end