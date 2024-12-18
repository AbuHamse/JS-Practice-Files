/*
16 CHAPTER 2 ■ INTERFACES

function implements(object) {
for(var i = 1; i < arguments.length; i++) { // Looping through all arguments
// after the first one.
var interfaceName = arguments[i];
var interfaceFound = false;
for(var j = 0; j < object.implementsInterfaces.length; j++) {
if(object.implementsInterfaces[j] == interfaceName) {
interfaceFound = true;
break;
}
}
if(!interfaceFound) {
return false; // An interface was not found.
}
}
return true; // All interfaces were found.
}
In this example, CompositeForm declares that it implements two interfaces, Composite and
FormItem. It does this by adding their names to an array, labeled as implementsInterfaces. The
class explicitly declares which interfaces it supports. Any function that requires an argument
to be of a certain type can then check this property and throw an error if the needed interface
is not declared.


*/

/*
interface Composite{
add(num1:Number,num2:Number):Number;
remove(num1:Number,num2:Number):Number;
reset():Void;
}

interface FormComposite{
submit(data:any):String | any | null;
}

class Composite{
constructor(id,method,action){
this.id = id;
this.method = method;
this.action = action
}

this.implementInterfaces = ['Composite','FormComposite']

addForm(formInstance){
if(!implements(formInstance, 'Composite', 'FormComposite')){
throw new Error('Object doesnt implement the required Interface')
}
}

function implement(object){

if(typeof object !== 'object' || arguments.length === 0){
throw new Error('Please enter a correct Argument')
}

//Loops through all the arguments passed in through the function(method)
for(let i = 0; i < arguments.length; i++){

// We assign the argument[i] to interfaceName 
// and set interfaceFound to false to begin the search


    const interfaceName = arguments[i];
    const interfaceFound = false;


//This for loop reference back the the "this.implementsInterface" array with the two interface
//names in the array. The object paramter calls that property in that class
// To access the contents of the array.
    for(let j = 0; j < object.implementsInterface.length; j++){
    if(object.implementsInterface === interfaceName){
    interfaceFound = true;
    console.log('Interface Implemented.')
    break
    }
if(!interfaceFound) throw new Error('Required Interface')


    }
}
}


/=============================================/

The Below example code is for the "Duck Typing" Interface Implementation.
There are 3 ways to do it, Commenting, Attribute and Duck Typing

Duck Typing 

// Interfaces.
var Composite = new Interface('Composite', ['add', 'remove', 'getChild']);
var FormItem = new Interface('FormItem', ['save']);
// CompositeForm class
var CompositeForm = function(id, method, action) {
...
};
...
function addForm(formInstance) {
ensureImplements(formInstance, Composite, FormItem);
// This function will throw an error if a required method is not implemented.
...
}


The Interface Implementation for This Book
For this book, we are using a combination of the first and third approaches. We use comments
to declare what interfaces a class supports, thus improving reusability and improving documentation. We use the Interface helper class and the class method Interface.ensureImplements
to perform explicit checking of methods. We return useful error messages when an object does
not pass the check.

Here is an example of our Interface class and comment combination:

// Interfaces.
var Composite = new Interface('Composite', ['add', 'remove', 'getChild']);
var FormItem = new Interface('FormItem', ['save']);

// CompositeForm class
var CompositeForm = function(id, method, action) { // implements Composite, FormItem
...
};
...

function addForm(formInstance) {
Interface.ensureImplements(formInstance, Composite, FormItem);
// This function will throw an error if a required method is not implemented,
// halting execution of the function.
// All code beneath this line will be executed only if the checks pass.
...
}

(Interface.ensureImplements) provides a strict check. If a problem is found, an error will be
thrown, which can either be caught and handled or allowed to halt execution. Either way, the
programmer will know immediately that there is a problem and where to go to fix it.


*/