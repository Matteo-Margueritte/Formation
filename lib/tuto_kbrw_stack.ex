defmodule KbrwStack do
  use Application

# See http://elixir-lang.org/docs/stable/elixir/Application.html
  # for more information on OTP Applications
  def start(_type, _args) do
#    Application.put_env(
#      :reaxt,:global_config,
#      Map.merge(
#        Application.get_env(:reaxt,:global_config), %{localhost: "http://localhost:4001"}
#      )
#    )
#    Reaxt.reload
    {:ok, super_pid} = Server.Supervisor.start_link
    Supervisor.which_children(super_pid) |> IO.inspect
    #    [{_, child_pid, _, _}] = Supervisor.which_children(super_pid)
    {:ok, super_pid}
  end
end
