defimpl ExFSM.Machine.State, for: Map do
  def state_name(order), do: String.to_atom(order["status"]["state"])
  def set_state_name(order, name), do: Kernel.get_and_update_in(order["status"]["state"], fn state -> {state, Atom.to_string(name)} end)
  def handlers(order) do
    [MyFSM.Paypal, MyFSM.Stripe]
  end
end


defmodule MyFSM do
  use Rulex

  defrule paypal_fsm(%{payment_method: :paypal} = order, acc), do: {:ok, [MyFSM.Paypal | acc]}
  defrule stripe_fsm(%{payment_method: :stripe} = order, acc), do: {:ok, [MyFSM.Stripe | acc]}

  defmodule Paypal do
    use ExFSM

    deftrans init({:process_payment, []}, order) do
      IO.puts("paypal verification")
      {:next_state, :not_verified, order}
    end

    deftrans not_verified({:verification, []}, order) do
      IO.puts("paypal finish")
      {:next_state, :finished, order}
    end
  end

  defmodule Stripe do
    use ExFSM

    deftrans init({:process_payment, []}, order) do
      IO.puts("stripe verification")
      {:next_state, :not_verified, order}
    end

    deftrans not_verified({:verification, []}, order) do
      IO.puts("stripe finish")
      {:next_state, :finished, order}
    end
  end
end
