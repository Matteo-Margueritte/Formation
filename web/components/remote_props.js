var Qs = require('qs')
var When = require('when')

import {HTTP} from "./http_request";

export var remoteProps = {
    user: (props)=>{
        return {
            url: "/api/me",
            prop: "user"
        }
    },
    orders: (props)=>{
        console.log("remote props", props)
        // if(!props.user)
        //     return, user_id: props.user.value.id
        const qs = {...props.qs, ...props.query}
        const query = Qs.stringify(qs)
        //console.log("query : ", query)
        return {
            url: "/api/orders" + (query == '' ? '?q=*:*' : '?' + query),
            prop: "orders"
        }
    },
    order: (props)=>{
        return {
            url: "/api/order/" + props.order_id,
            prop: "order"
        }
    }
}

export function addRemoteProps(props){
    return new Promise((resolve, reject)=>{    //Here we could call `[].concat.apply` instead of `Array.prototype.concat.apply`
        //apply first parameter define the `this` of the concat function called
        //Ex [0,1,2].concat([3,4],[5,6])-> [0,1,2,3,4,5,6]
        // <=> Array.prototype.concat.apply([0,1,2],[[3,4],[5,6]])
        //Also `var list = [1,2,3]` <=> `var list = new Array(1,2,3)`
        var remoteProps = Array.prototype.concat.apply([],
            props.handlerPath
                .map((c)=> c.remoteProps) // -> [[remoteProps.user], [remoteProps.orders], null]
                .filter((p)=> p) // -> [[remoteProps.user], [remoteProps.orders]]
        )

        remoteProps = remoteProps
            .map((spec_fun)=> spec_fun(props) ) // -> 1st call [{url: '/api/me', prop: 'user'}, undefined]
            // -> 2nd call [{url: '/api/me', prop: 'user'}, {url: '/api/orders?user_id=123', prop: 'orders'}]
            .filter((specs)=> specs) // get rid of undefined from remoteProps that don't match their dependencies
            .filter((specs)=> !props[specs.prop] ||  props[specs.prop].url != specs.url) // get rid of remoteProps already resolved with the url

        if(remoteProps.length == 0)
            return resolve(props)   // check out https://github.com/cujojs/when/blob/master/docs/api.md#whenmap and https://github.com/cujojs/when/blob/master/docs/api.md#whenreduce
        console.log(remoteProps)
        var promise = When.map( // Returns a Promise that either on a list of resolved remoteProps, or on the rejected value by the first fetch who failed
            remoteProps.map((spec)=>{ // Returns a list of Promises that resolve on list of resolved remoteProps ([{url: '/api/me', value: {name: 'Guillaume'}, prop: 'user'}])
                return HTTP.get(spec.url)
                    .then((result)=>{spec.value = result; return spec}) // we want to keep the url in the value resolved by the promise here. spec = {url: '/api/me', value: {name: 'Guillaume'}, prop: 'user'}
            })
        )

        When.reduce(promise, (acc, spec)=>{ // {url: '/api/me', value: {name: 'Guillaume'}, prop: 'user'}
            acc[spec.prop] = {url: spec.url, value: spec.value}
            return acc
        }, props).then((newProps)=>{
            console.log(newProps)
            addRemoteProps(newProps).then(resolve, reject)
        }, reject)
    })
}