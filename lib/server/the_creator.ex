defmodule Server.TheCreator do
  defmacro __using__(_opts) do
    quote do
      import Server.TheCreator
      import Plug.Conn

      @get_calls []
      @error_info [code: 500, content: "Not implemented"]

      @before_compile Server.TheCreator
    end
  end

  defmacro __before_compile__(_env) do
    quote do
      def init(opts) do
        opts
      end

      def call(conn,_opts) do
        tmp = conn.request_path
        Enum.find(@get_calls, fn {path, _} -> tmp == path end)
        |> case do
             {path, {status, message}} ->
               Plug.Conn.send_resp(conn, status, message)
             _ ->
               Plug.Conn.send_resp(conn, Keyword.fetch!(@error_info, :code), Keyword.fetch!(@error_info, :content))
           end
      end
    end
  end

  defmacro my_get(path, do: block) do
    quote do
      @get_calls [{unquote(path), unquote(block)} | @get_calls]
    end
  end

  defmacro my_error(params) do
    quote do
      @error_info unquote(params)
    end
  end
end