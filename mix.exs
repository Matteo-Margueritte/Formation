defmodule KbrwStack.Mixfile do
  use Mix.Project

  def project do
    [app: :kbrw_stack,
     version: "0.1.0",
     elixir: "~> 1.3",
     build_embedded: Mix.env == :prod,
     start_permanent: Mix.env == :prod,
      compilers: [:reaxt_webpack] ++ Mix.compilers,
     deps: deps()]
  end

  # Configuration for the OTP application
  #
  # Type "mix help compile.app" for more information
  def application do
    [applications: [:logger, :cowboy, :inets, :reaxt],
     mod: {KbrwStack, []}]
  end

  # Dependencies can be Hex packages:
  #
  #   {:mydep, "~> 0.3.0"}
  #
  # Or git/path repositories:
  #
  #   {:mydep, git: "https://github.com/elixir-lang/mydep.git", tag: "0.1.0"}
  #
  # Type "mix help deps" for more examples and options
  defp deps do
    [
      {:reaxt, "~> 3.0.0", github: "kbrw/reaxt"},
      {:rulex, git: "https://github.com/kbrw/rulex.git"},
      {:exfsm, git: "https://github.com/kbrw/exfsm.git"},
      {:cowboy, "~> 1.0.0"},
      {:plug, "~> 1.3.4"},
      {:poison, "~> 2.1"}
    ]
  end
end
