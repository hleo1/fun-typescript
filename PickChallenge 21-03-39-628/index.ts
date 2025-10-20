
// https://github.com/type-challenges/type-challenges/blob/main/questions/00004-easy-pick/README.md
interface Todo {
    title: string
    description: string
    completed: boolean
  }
  

//Idea 1
type MyPick1<Interface, Chosen_Properties>  = {
    [Property in keyof Interface] : Interface[Property]
}


//Idea 2
type MyPick2<Interface, Chosen_Properties>  = {
    [Property in keyof Interface as Extract<keyof Interface, Chosen_Properties>] : Interface[Property]
}
//Somehow this doesn't give me red squiggly... Why???

type MyPick3<Interface, Chosen_Properties>  = {
    [Property in keyof Interface as Extract<keyof Interface, Chosen_Properties>] : Interface[Property]
}

type ToDoPreview = MyPick3<Todo, "title" | "mystery">

let ToDo: ToDoPreview = {
    title: "hey", 
    myster: "no"
}


// //Idea 3
// type MyPick3<Interface, Chosen_Properties extends keyof Interface> = {
//     [Property in Chosen_Properties]: Interface[Property];
// }

// // type TodoPreview = MyPick3<Todo, 'title' | 'completed' | 'mystery'>


// //Teset
// type MyPickTest<Interface, Chosen_Properties>  = {
//     [Property in keyof Interface as Exclude<keyof Interface, "mystery">] : Interface[Property]
// }

// type TodoPreview = MyPickTest<Todo, 'title' | 'completed' | 'mystery'>
