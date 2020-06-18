defmodule MyJSONApi do
  use Ewebmachine.Builder.Handlers
  plug :cors
  plug :add_handlers, init: %{}

  content_types_provided do: ["application/json": :to_json]
  defh to_json, do: Poison.encode!(state[:json_obj] |> IO.inspect)

  defp cors(conn,_), do:
    put_resp_header(conn,"Access-Control-Allow-Origin","*")
end


defmodule ErrorRoutes do
  use Ewebmachine.Builder.Resources ; resources_plugs
  resource "/error/:status" do %{s: elem(Integer.parse(status),0)} after
    content_types_provided do: ['text/html': :to_html, 'application/json': :to_json]
    defh to_html, do: "<h1> Error ! : '#{Ewebmachine.Core.Utils.http_label(state.s)}'</h1>"
    defh to_json, do: ~s/{"error": #{state.s}, "label": "#{Ewebmachine.Core.Utils.http_label(state.s)}"}/
    finish_request do: {:halt,state.s}
  end
end

defmodule Server.FullApi do
  use Ewebmachine.Builder.Resources ; resources_plugs
  require EEx

  if Mix.env == :dev, do: plug Ewebmachine.Plug.Debug
  #  resources_plugs error_forwarding: "/error/:status", nomatch_404: true
  plug ErrorRoutes
  #plug :match

  resource "/api/order/:remoteid" do %{remoteid: remoteid} after
    allowed_methods do: ["GET"]
    content_types_provided do: ["application/json": :to_json]
    resource_exists do
      body = Server.Riak.get_object("orders", state.remoteid)
      pass body != nil, order: Poison.decode!(body)
    end
    delete_resource do: Server.Riak.delete_object("orders", state.remoteid)
    defh to_json do
      Poison.encode!(state.order)
    end
  end

  resource "/api/order/process/:action" do %{action: action} after
    plug(Plug.Parsers, parsers: [:json], json_decoder: Poison)
    allowed_methods do: ["POST"]
    content_types_provided do: ["application/json": :to_json]
    process_post do
      res = Server.Supervisor.handle_order(conn.body_params, state.action)
      pass res !== nil, order: res
    end
    defh to_json do
      Poison.encode!(state.order)
    end
  end

  resource "/api/orders" do %{} after
    @defaults %{"page" => "1", "rows" => "30", "sort" => "creation_date_index"}
    allowed_methods do: ["GET"]
    content_types_provided do: ["applicaton/json": :to_json]
    resource_exists do
      conn = fetch_query_params(conn) |> IO.inspect
      %{"page" => page, "rows" => rows, "q" => query, "sort" => sort} = Map.merge(@defaults, conn.params)
                                                                        |> IO.inspect
      case Server.Riak.search("orders", query, page, rows, sort) do
        {:ok, body} ->
          res = Task.async_stream(body["response"]["docs"], &Server.Riak.get_json_object/1, max_concurrency: 10)
                |> Enum.reduce([], fn {:ok, order}, acc -> [order | acc] end)
          pass true, orders: %{"numFound" => body["response"]["numFound"], "orders" => res}
        {:error, _} -> pass true, orders: %{"numFound" => 0, "orders" => []}
      end
    end
    defh to_json do
      Poison.encode!(state.orders)
    end
  end

  resource "/public/*path" do
    %{path: Enum.join(path,"/")}
  after
    resource_exists do
      File.regular?(path(state.path)) |> IO.inspect
    end
    content_types_provided do
      path(state.path)
      res = {state.path|>Plug.MIME.path|>default_plain,:to_content}
      [res]
    end
    defh to_content do
      File.stream!(path(state.path),[],300_000_000)
    end
    defp path(relative) do
      "priv/static/#{relative}"
    end
    defp default_plain("application/octet-stream"), do: "text/plain"
    defp default_plain(type), do: type
  end

  resource "/" do %{} after
    EEx.function_from_file :defp, :layout, "web/layout.html.eex", [:render]
    content_types_provided do: ["text/html": :to_html]
    resource_exists do
      conn = fetch_query_params(conn)
      render = Reaxt.render!(:app, %{path: conn.request_path, cookies: conn.cookies, query: conn.params},30_000)
      pass true, render: render
    end
    defh to_html do
      layout(state.render)
    end
  end

end