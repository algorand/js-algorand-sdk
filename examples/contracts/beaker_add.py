from beaker import *
from pyteal import *

app = Application("Adder")

@app.external
def add(a: abi.Uint64, b: abi.Uint64, *, output: abi.Uint64) -> Expr:
    return output.set(a.get() + b.get())

@app.external
def set_name(name: abi.String) -> Expr:
    return App.box_put(Bytes("Name"), name.get())

@app.create(bare=True)
def create() -> Expr:
    return Approve()

app.build().export("beaker_add_artifacts")