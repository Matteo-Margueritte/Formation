defmodule MyGenericServer do
  def loop({callback_module, server_state}) do
    receive do
      {:call, caller, request} ->
        result = callback_module.handle_call(request, server_state)
        send caller, {:response, elem(result, 0)}
        loop({callback_module, elem(result, 1)})
      {:cast, request} ->
        result = callback_module.handle_cast(request, server_state)
        loop({callback_module, result})
    end
  end

  def cast(process_pid, request) do
    send process_pid, {:cast, request}
  end

  def call(process_pid, request) do
    send process_pid, {:call, self(), request}
    receive do
      {:response, data} -> data
    end
  end

  def start_link(callback_module, server_initial_state) do
    pid = spawn_link(fn -> loop({callback_module, server_initial_state}) end)
    {:ok, pid}
  end
end

defmodule AccountServer do
  def handle_cast({:credit, c}, amount), do: amount + c
  def handle_cast({:debit, c}, amount), do: amount - c
  def handle_call(:get, amount) do
    #Return the response of the call, and the new inner state of the server
    {amount, amount}
  end

  def start_link(initial_amount) do
    MyGenericServer.start_link(AccountServer,initial_amount)
  end
end

{:ok, my_account} = AccountServer.start_link(4)
MyGenericServer.cast(my_account, {:credit, 5})
MyGenericServer.cast(my_account, {:credit, 2})
MyGenericServer.cast(my_account, {:debit, 3})
amount = MyGenericServer.call(my_account, :get)
IO.puts "current credit hold is #{amount}"
