defmodule JsonLoader do

  def upload_order(order) do
    %{order | state}
    Server.Riak.create_object("orders", order["id"], order)
  end

#  command.status.state == 'init';

  def initialize_commands(bucket) do
    Riak.get_keys(bucket)
    |> Enum.map(
         fn key ->
           # update the json here
         end)
  end
  def load_to_database(json_file) do
    json_file
    |> File.read!
    |> Poison.decode!
    |> Task.async_stream(&JsonLoader.upload_order/1, max_concurrency: 10)
    |> Stream.run
  end
end