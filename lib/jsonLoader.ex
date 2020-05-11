defmodule JsonLoader do

  def load_to_database(database, json_file) do
    json_file
    |> File.read!
    |> Poison.decode!
    |> Enum.map(fn order ->
      GenServer.cast(database, {:create, order["id"], order})
    end)
  end
end