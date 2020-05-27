defmodule Server.Database do
  use GenServer
  
  def start_link(:ok) do
    GenServer.start_link(__MODULE__, :ok, name: __MODULE__)
  end
  
  @impl true
  def init(:ok) do
    state = {:ets.new(:table, [:named_table, :set]), 0}
    {:ok, state}
  end
  
  @impl true
  def handle_call({:read, key}, _from, state) do
    :ets.lookup(:table, key)
    |> case do
      [] -> {:reply, nil, state}
      [{_, found}] -> {:reply, found, state}
    end
  end

  @impl true
  def handle_call(:count,_from, {table, count}) do
    {:reply, count, {table, count}}
  end

  @impl true
  def handle_call({:page, number_of_elements, start}, _from, {table, count}) when
        number_of_elements < 20 and
        number_of_elements < count and
        start < count and
        start >= 0 and
        number_of_elements + start < count do
    orders = Enum.reduce(get_n_keys(start, number_of_elements, table), [], fn key,acc ->
      [{_, res}] = :ets.lookup(table, key)
      [res | acc]
    end)
    {:reply, orders,{table, count}}
  end

  @impl true
  def handle_call({:create, key, value}, _from, {table,  count}) do
    :ets.insert_new(:table, {key, value})
    |> case do
         true -> {:reply, "Value created", {table, count + 1}}
         false -> {:reply, "Key already existing", {table, count + 1}}
       end
  end

  def get_n_keys(start, number_of_keys, table) do
    Enum.reduce(start..number_of_keys, [], fn _,acc ->
      case acc do
        [] -> [:ets.first(table)]
        [head | _] -> [:ets.next(table, head) | acc]
      end
    end)
  end

  @impl true
  def handle_cast({:update, key, value}, state) do
    :ets.insert(:table, {key, value})
    {:noreply, state}
  end

  @impl true
  def handle_cast({:delete, key}, {table, count}) do
    :ets.delete(:table, key)
    {:noreply, {table, count - 1}}
  end

  def search(database, criteria) do
    criteria |> Enum.map(fn criteria ->
      {key, keyvalue} = criteria
                        |> IO.inspect
      if key == "remoteid" do
        GenServer.call(database, {:read, keyvalue})
      end
    end) |> Enum.filter(& !is_nil(&1))
  end

end