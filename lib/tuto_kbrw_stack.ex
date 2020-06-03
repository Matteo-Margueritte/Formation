defmodule KbrwStack do
use Application

  # See http://elixir-lang.org/docs/stable/elixir/Application.html
  # for more information on OTP Applications
  def start(_type, _args) do
    {:ok, super_pid} = Server.Supervisor.start_link
    Supervisor.which_children(super_pid)
#    [{_, child_pid, _, _}] = Supervisor.which_children(super_pid)



    {:ok, super_pid}
  end

end
