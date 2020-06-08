defmodule Server.Riak do
  @moduledoc false

  def get_buckets() do
    {:ok, {{'HTTP/1.1', 200, 'OK'}, _headers, _body}} =
      :httpc.request(:get, {'http://127.0.0.1:8098/buckets?buckets=true', []}, [], [])
  end

  def get_keys(bucket) do
    {:ok, {{'HTTP/1.1', 200, 'OK'}, _headers, body}} =
      :httpc.request(:get, {'http://127.0.0.1:8098/buckets/#{bucket}/keys?keys=true', []}, [], [])
  end

  def get_object(bucket, key) do
    {:ok, {{'HTTP/1.1', 200, 'OK'}, headers, body}} =
      :httpc.request(:get, {'http://127.0.0.1:8098/buckets/#{bucket}/keys/#{key}', []}, [], [])
  end

  def get_json_object(key) do
    [head | _] = key["id"]
    {:ok,{_,_,body}} = get_object("orders", head)
    Poison.decode!(body)
  end

  def get_schema(schema) do
    {:ok, {{'HTTP/1.1', 200, 'OK'}, _headers, _body}} =
      :httpc.request(:get, {'http://127.0.0.1:8098/search/schema/#{schema}', []}, [], [])
  end

  def create_object(bucket, key, object) do
    {:ok, {{'HTTP/1.1', 200, 'OK'}, _headers, _body}} =
      :httpc.request(:post, {'http://127.0.0.1:8098/buckets/#{bucket}/keys/#{key}?returnbody=true', [], 'application/json', Poison.encode!(object)}, [], [])
  end

  def delete_object(bucket, key) do
    {:ok, {{'HTTP/1.1', 204, 'No Content'}, _headers, _body}} =
      :httpc.request(:delete, {'http://127.0.0.1:8098/buckets/#{bucket}/keys/#{key}', []}, [], [])
  end

  def delete_bucket(bucket) do
    {:ok, {{'HTTP/1.1', 204, 'No Content'}, _headers, _body}} =
      :httpc.request(:delete, {'http://127.0.0.1:8098/buckets/#{bucket}/props', []}, [], [])
  end


  def upload_schema(schema, schema_path) do
    {:ok, {{'HTTP/1.1', 204, 'No Content'}, _headers, _body}} =
      :httpc.request(:put, {'http://127.0.0.1:8098/search/schema/#{schema}', [], 'application/xml', IO.binread(File.open!(schema_path), :all)}, [{:timeout, 1000}], [])
  end

  def create_index(index, schema) do
    {:ok, {_res, _headers, _body}} =
      :httpc.request(:put, {'http://127.0.0.1:8098/search/index/#{index}', [], 'application/json', Poison.encode!(%{"schema" => schema})}, [], [])
  end

  def assign_index(index, bucket) do
    {:ok, {{'HTTP/1.1', 204, 'No Content'}, _headers, _body}} =
      :httpc.request(:put, {'http://127.0.0.1:8098/buckets/#{bucket}/props', [], 'application/json', Poison.encode!(%{"props" => %{"search_index" => index}})}, [], [])
  end

  def get_bucket_props(bucket) do
    {:ok, {{'HTTP/1.1', 200, 'OK'}, _headers, _body}} =
      :httpc.request(:get, {'http://127.0.0.1:8098/buckets/#{bucket}/props', []}, [], [])
  end

  def search(index, query, page, rows, sort) do
    page = String.to_integer(page) - 1 |> IO.inspect
    rows = String.to_integer(rows) |> IO.inspect
    url = 'http://127.0.0.1:8098/search/query/#{index}/?wt=json&q=#{query}&start=#{rows * page}&rows=#{rows}&sort=#{sort}%20desc'
          |> IO.inspect
    case :httpc.request(:get, {url, []}, [], []) do
      {:ok, {{'HTTP/1.1', 200, 'OK'}, _headers, body}} -> {:ok, Poison.decode!(body)}
      {:ok, {{'HTTP/1.1', 400, _}, _,_}} -> {:error, nil}
    end
  end

end
