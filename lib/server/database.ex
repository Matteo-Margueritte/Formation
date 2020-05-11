defmodule Server.Database do
  use GenServer

  def start_link(:ok) do
    GenServer.start_link(__MODULE__, :ok, name: __MODULE__)
  end

  @impl true
  def init(:ok) do
    state = :ets.new(:table, [:named_table, :set])
    {:ok, state}
  end

  @impl true
  def handle_call({:read, key}, _from, state) do
    :ets.lookup(:table, key)
    |> case do
         [] -> {:reply, "Key not found", state}
         [found] -> {:reply, found, state}
       end
  end

  @impl true
  def handle_call({:create, key, value}, _from, state) do
    :ets.insert_new(:table, {key, value})
    |> case do
         true -> {:reply, "Value created", state}
         false -> {:reply, "Key already existing", state}
       end
  end

  @impl true
  def handle_cast({:update, key, value}, state) do
    :ets.insert(:table, {key, value})
    {:noreply, state}
  end

  @impl true
  def handle_cast({:delete, key}, state) do
     :ets.delete(:table, key)
     {:noreply, state}
  end

  def search(database, criteria) do
    criteria |> Enum.map(fn criteria ->
      {key, keyvalue} = criteria
      if key == "key" do
        elem(GenServer.call(database, {:read, keyvalue}), 1)
      end
    end) |> Enum.filter(& !is_nil(&1))
  end

end