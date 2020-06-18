import {addRemoteProps, remoteProps} from "./remote_props";
import {HTTP} from "./http_request";

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

var cn = function() {
    var args = arguments, classes = {}
    for (var i in args) {
        var arg = args[i]
        if(!arg) continue
        if ('string' === typeof arg || 'number' === typeof arg) {
            arg.split(" ").filter((c)=> c!="").map((c)=>{
                classes[c] = true
            })
        } else if ('object' === typeof arg) {
            for (var key in arg) classes[key] = arg[key]
        }
    }
    return Object.keys(classes).map((k)=> classes[k] && k || '').join(' ')
}

var ConfirmationModal = createReactClass({

    handleNo(e) {
        e.preventDefault()
        this.props.callback(0)
    },

    handleYes(e) {
        e.preventDefault()
        this.props.callback(1)
    },

    render(){
        return (
            <JSXZ in="orders" sel=".confirmation-content">
                <Z sel=".confirmation-text">
                    {this.props.message}
                </Z>
                <Z sel=".confirmation-modal-yes" onClick={this.handleYes}>
                    <ChildrenZ/>
                </Z>
                <Z sel=".confirmation-modal-no" onClick={this.handleNo}>
                    <ChildrenZ/>
                </Z>
            </JSXZ>
        )
    }
})

export var Layout = createReactClass({
    modal(spec) {
        this.setState({modal: {
                ...spec,
                callback: (res)=>{
                    this.setState({modal: null},()=>{
                        if(spec.callback) spec.callback(res)
                    })
                }
            }})
    },

    getInitialState() {
        return ({
            modal: null,
            loader: true
        })
    },

    loader(promise) {
        this.setState({loader: false})
        return promise.finally(() => this.setState({loader: true}))
    },

    render() {
        var modal_component = {
            'confirmation': (props) => <ConfirmationModal {...props}/>
        }[this.state.modal && this.state.modal.type];
        console.log(this.state)
        modal_component = modal_component && modal_component(this.state.modal)

        var props = {
            ...this.props, modal: this.modal, loader: this.loader
        }

        return <JSXZ in="orders" sel=".layout">
            <Z sel=".confirmation-wrapper" className={cn(classNameZ, {'hidden': !modal_component})}>
                {modal_component}
            </Z>
            <Z sel=".loader-wrapper" className={cn(classNameZ, {'hidden': this.state.loader})}>
                <ChildrenZ/>
            </Z>
            <Z sel=".header-container">
                <Child {...props}/>
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
    statics: {
        remoteProps: [remoteProps.order]
    },

    handlePay(order) {
        this.props.modal({
            type: 'confirmation',
            title: 'Order Payment',
            message: `Are you sure you want pay this order ?`,
            callback: (value)=>{
                if (value === 1) {
                    this.props.loader(HTTP.post("/api/order/process/process_payment", order)).then(_ => {
                        this.props.Link.ReloadProps("order")
                    }).catch(err => {
                        console.error(err)
                    })
                }
            }
        })
    },

    render() {
        const order = this.props.order.value
        return (
            <JSXZ in="details" sel=".order">
                <Z sel=".basic-div-block">
                    <ChildrenZ/>
                </Z>
                <Z sel=".orderdetailwrapper">
                    <Child {...this.props}/>
                </Z>
                <Z sel=".orderstatus">
                    {"Status : " + order.status.state}
                </Z>
                <Z sel=".orderprocess" onClick={(e) => {e.preventDefault(); this.handlePay(order)}}>
                    <ChildrenZ/>
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
                <Z sel=".orderdetailorderid">
                    {order.remoteid}
                </Z>
                <Z sel=".orderdetailaddress">
                    {order.custom.billing_address.street.join() + " " + order.custom.billing_address.postcode + " " + order.custom.billing_address.city}
                </Z>
                <Z sel=".orderdetailclientname">
                    {order.custom.customer.full_name}
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

    getInitialState() {
        return {searchInput: ""}
    },

    deleteModal(remoteid) {
        this.props.modal({
            type: 'confirmation',
            title: 'Order deletion',
            message: `Are you sure you want to delete this ?`,
            callback: (value)=>{
                if (value === 1) {
                    this.props.loader(HTTP.delete("/api/order/" + remoteid)).then(_ => {
                        this.props.Link.ReloadProps("orders")
                    })
                }
            }
        })
    },

    handleSubmit() {
        this.props.Link.GoTo("orders", [], {q: this.state.searchInput === '' ? '*:*' : this.state.searchInput})
    },

    handleInput(event) {
        this.setState({searchInput: event.target.value})
    },

    changePage(page) {
        this.props.Link.GoTo("orders", [], {q: this.state.searchInput === '' ? '*:*' : this.state.searchInput, page})
    },

    render() {
        const result = this.props.orders.value.orders.map((order, index) =>
            (<JSXZ key={index} in="orders" sel=".columns-4">
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
                    <Z sel=".orderdetailbutton" onClick={(e) => {e.preventDefault(); this.props.Link.GoTo("order", order.id, "")}}>
                        <ChildrenZ/>
                    </Z>
                    <Z sel=".orderstatusdetail">
                        {"Status : " + order.status.state}
                    </Z>
                    <Z sel=".orderpaybutton" onClick={(e) => {e.preventDefault(); this.deleteModal(order.id)}} href="">
                        <ChildrenZ/>
                    </Z>
                </JSXZ>
            ))
        let pagination = []
        for (let i = 0, p = 0; i < this.props.orders.value.numFound; i += 30) {
            pagination.push(
                <JSXZ key={p} in="orders" sel=".homepaginationwrapper">
                    <Z sel=".homebottompagination" href="" onClick={(e) => {e.preventDefault(); this.changePage(p);}}>
                        {p}
                    </Z>
                </JSXZ>
            )
            p++
        }
        return (
            <JSXZ in="orders" sel=".orders">
                <Z sel=".div-block-2">
                    <JSXZ in="orders" sel=".homesearchform" onSubmit={(e) => {e.preventDefault(); this.handleSubmit()}}>
                        <Z sel=".homesearchfield" value={this.state.searchInput} onChange={this.handleInput}>
                        </Z>
                    </JSXZ>
                </Z>
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
                <Z sel=".orderspagination">
                    {pagination}
                </Z>
            </JSXZ>
        )
    }
})
