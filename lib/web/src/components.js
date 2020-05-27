import {remoteProps} from "./remote_props";

var createReactClass = require('create-react-class')
var React = require("react")

export var Child = createReactClass({
    render() {
        var [ChildHandler,...rest] = this.props.handlerPath
        if (!ChildHandler)
            return null
        return <ChildHandler {...this.props} handlerPath={rest} />
    }
})

export var Layout = createReactClass({
    render() {
        return <JSXZ in="orders" sel=".layout">
            <Z sel=".header-container">
                <Child {...this.props}/>
            </Z>
        </JSXZ>
    }
})

export var Header = createReactClass({
    render() {
        return (
            <JSXZ in="orders" sel=".header-container">
                <Z sel=".orders">
                    <Child {...this.props}/>
                </Z>
            </JSXZ>
        )
    }
})

export var Order = createReactClass({
    render() {
        return (
            <JSXZ in="details" sel=".order">
                <Z sel=".basic-div-block">
                    <ChildrenZ/>
                </Z>
                <Z sel=".orderdetailwrapper">
                    <Child {...this.props}/>
                </Z>
            </JSXZ>
        )
    }
})

export var OrderDetail = createReactClass({
    statics: {
        remoteProps: [remoteProps.order]
    },

    render() {
        console.log(this.props.order.value.custom.items)
        var items = this.props.order.value.custom.items.map((item, index) => (
            <JSXZ key={index} in="details" sel=".columns-8">
                <Z sel=".productname">
                    {item.product_title}
                </Z>
                <Z sel=".orderdetailquantity">
                    {item.quantity_to_fetch}
                </Z>
                <Z sel=".orderdetailunitprice">
                    {item.unit_price}
                </Z>
                <Z sel=".orderdetailtotalprice">
                    {item.quantity_to_fetch * item.unit_price}
                </Z>
            </JSXZ>
        ))

        var order = this.props.order.value

        return (
            <JSXZ in="details" sel=".columns-5">
                <Z sel=".orderdetailcustomerdetail">
                    <JSXZ in="details" sel=".div-block-4">
                        <Z sel=".orderdetailorderid">
                            {this.props.order.value.remoteid}
                        </Z>
                        <Z sel=".orderdetailaddress">
                            {order.custom.billing_address.street.join() + " " + order.custom.billing_address.postcode + " " + order.custom.billing_address.city}
                        </Z>
                        <Z sel=".orderdetailclientname">
                            {this.props.order.value.custom.customer.full_name}
                        </Z>
                    </JSXZ>
                </Z>
                <Z sel=".orderdetailitemsdetail">
                    <JSXZ in="details" sel=".columns-6">
                        <Z sel=".column-7"><ChildrenZ/></Z>
                        <Z sel=".detailheadermidcolumn"><ChildrenZ/></Z>
                        <Z sel=".detailheadermidcolumn"><ChildrenZ/></Z>
                        <Z sel=".column-8"><ChildrenZ/></Z>
                    </JSXZ>
                    {items}
                </Z>
            </JSXZ>
        )
    }
})

export var Orders = createReactClass( {
    statics: {
        remoteProps: [remoteProps.orders]
    },

    render(){
        var result = this.props.orders.value.map((order, index) => (<JSXZ key={index} in="orders" sel=".columns-4">
                <Z sel=".home-order-command-number">
                    {order.remoteid}
                </Z>
                <Z sel=".home-order-customer">
                    {order.custom.customer.full_name}
                </Z>
                <Z sel=".quantity">
                    {order.custom.items.length}
                </Z>
                <Z sel=".home-order-address">
                    {order.custom.billing_address.street.join() + " " + order.custom.billing_address.postcode + " " + order.custom.billing_address.city}
                </Z>
                <Z sel=".orderdetailbutton" href={"/order/" + order.remoteid}>
                    <ChildrenZ/>
                </Z>
            </JSXZ>
        ))
        return (
            <JSXZ in="orders" sel=".orders">
                <Z sel=".div-block-3">
                    <JSXZ in="orders" sel=".columns-3">
                        <Z sel=".leftcolumn"><ChildrenZ></ChildrenZ></Z>
                        <Z sel=".middlecolumn"><ChildrenZ></ChildrenZ></Z>
                        <Z sel=".middlecolumn"><ChildrenZ></ChildrenZ></Z>
                        <Z sel=".middlecolumn"><ChildrenZ></ChildrenZ></Z>
                        <Z sel=".middlecolumn"><ChildrenZ></ChildrenZ></Z>
                        <Z sel=".rightcolumn"><ChildrenZ></ChildrenZ></Z>
                    </JSXZ>
                    {result}
                </Z>
            </JSXZ>
        )
    }
})
