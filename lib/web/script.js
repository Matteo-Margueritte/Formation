var createReactClass = require('create-react-class')

var Page = createReactClass({
  render(){
    return <JSXZ in="template" sel=".container">
      <Z sel=".item">Burgers</Z>,
      <Z sel=".price">50</Z>
    </JSXZ>
  }
})

ReactDOM.render(
  <Page/>,
  document.getElementById('root')
)

//Première partie

// var test = 42
// var kbrw = "the best"

//<Declaration var="test" value="42"/>
//<Declaration var="kbrw" value="the best"/>
//<Declaration var="test" value={42}/>
// var createDiv = () => {
//     element = <h1>Hello world</h1>
//     ReactDOM.render(element, document.getElementById('root'))
// }
