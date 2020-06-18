defmodule OrderHandler do
  @moduledoc false

  use GenServer

  def start_link(order) do
    GenServer.start_link(__MODULE__, order)
  end

  @impl true
  def init(order) do
    {:ok, order}
  end

  @impl true
  def handle_call({:transition, action}, _from, order) do
    case ExFSM.Machine.event(order, {String.to_atom(action), []}) do
      {:next_state, {_, res}} -> Server.Riak.create_object("orders", res["id"], res)
                                 {:reply, res, res}
      {:error, _} -> {:reply, nil, order}
    end
  end
end