


interface Todo {
    title: string
    description: string
}

type MyReadonly<Type> = {
    +readonly [P in keyof Type] : Type[P]
};
  
const todo: MyReadonly<Todo> = {
    title: "Hey",
    description: "foobar"
}
  
  todo.title = "Hello" // Error: cannot reassign a readonly property
  todo.description = "barFoo" // Error: cannot reassign a readonly property