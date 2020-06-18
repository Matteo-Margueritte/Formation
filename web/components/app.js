require('!!file-loader?name=[name].[ext]!../layout.html.eex')
/* required library for our React app */
var ReactDOM = require('react-dom')
var React = require("react")
var createReactClass = require('create-react-class')
var Qs = require('qs')
var Cookie = require('cookie')

import {Layout, Child, Order, Orders, Header,OrderDetail} from "./components";
import {addRemoteProps} from "./remote_props";

/* required css for our application */
require('../webflow/orders.css');

var propsToReload = []

var browserState = {
}

var ErrorPage = createReactClass({
    render() {
        return <h1>{this.props.message}</h1>
    }
})

var routes = {
    "order": {
        path: (params) => {
            return "/order/" + params;
        },
        match: (path, qs) => {
            var r = new RegExp("/order/([^/]*)$").exec(path)
            return r && {handlerPath: [Layout, Header, Order, OrderDetail], order_id: r[1]}
        }
    },
    "orders": {
        path: (params) => {
            return "/";
        },
        match: (path, qs) => {
            return {handlerPath: [Layout, Header, Orders]}
        }
    }
}

//window.addEventListener("popstate", ()=>{ onPathChange() })

function inferPropsChange(path,query,cookies){ // the second part of the onPathChange function have been moved here
    browserState = {
        ...browserState,
        path: path, qs: query,
        Link: Link,
        Child: Child,
        query: query,
    }

    var route, routeProps
    for(var key in routes) {
        routeProps = routes[key].match(path, query)
        if(routeProps){
            route = key
            break
        }
    }

    if(!route){
        return new Promise( (res,reject) => reject({http_code: 404}))
    }
    browserState = {
        ...browserState,
        ...routeProps,
        route: route
    }

    propsToReload.forEach(propsName => {
        if (browserState.hasOwnProperty(propsName))
            browserState[propsName] = null
    })
    propsToReload = []

    console.log("browser state", browserState)
    return addRemoteProps(browserState).then(
        (props)=>{
            browserState = props
        })
}



var Link = createReactClass({
    statics: {
        renderFunc: null, //render function to use (differently set depending if we are server sided or client sided)
        GoTo(route, params, query){// function used to change the path of our browser
            var path = routes[route].path(params)
            var qs = Qs.stringify(query)
            var url = path + (qs == '' ? '' : '?' + qs)
            console.error(url)
            history.pushState({},"",url)
            Link.onPathChange()
        },
        ReloadProps(propsList) {
            propsToReload = propsToReload.concat(propsList)
            this.onPathChange()
        },

        onPathChange(){ //Updated onPathChange
            var path = location.pathname
            var qs = Qs.parse(location.search.slice(1))
            var cookies = Cookie.parse(document.cookie)
            inferPropsChange(path, qs, cookies).then( //inferPropsChange download the new props if the url query changed as done previously
                ()=>{
                    Link.renderFunc(<Child {...browserState}/>) //if we are on server side we render
                },({http_code})=>{
                    Link.renderFunc(<ErrorPage message={"Not Found"} code={http_code}/>, http_code) //idem
                }
            )
        },
        LinkTo: (route,params,query)=> {
            var qs = Qs.stringify(query)
            return routes[route].path(params) +((qs=='') ? '' : ('?'+qs))
        },

    },

    onClick(ev) {
        ev.preventDefault();
        Link.GoTo(this.props.to,this.props.params,this.props.query);
    },

    render (){//render a <Link> this way transform link into href path which allows on browser without javascript to work perfectly on the website
        return (
            <a href={Link.LinkTo(this.props.to,this.props.params,this.props.query)} onClick={this.onClick}>
                {this.props.children}
            </a>
        )
    }
})

module.exports = {
    reaxt_server_render(params, render){
        inferPropsChange(params.path, params.query, params.cookies)
            .then(()=>{
                console.log("server render")
                render(<Child {...browserState}/>)
            },(err)=>{
                render(<ErrorPage message={"Not Found :" + err.url } code={err.http_code}/>, err.http_code)
            })
    },

    reaxt_client_render(initialProps, render){
        console.log("client render")
        browserState = initialProps
        Link.renderFunc = render
        window.addEventListener("popstate", ()=>{ Link.onPathChange() })
        Link.onPathChange()
    }
}