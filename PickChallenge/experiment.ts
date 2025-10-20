// Playing with Extract vs Extends (static compile vs )
//Static Type Filtering i.e. using Extends vs Dynamic Type Filtering -> i.e. Extract/Exclude
type RemoveKindField<Type, Chosen_Properties> = {
    [Property in keyof Type as Extract<Property, Chosen_Properties>]: Type[Property]
};
 
interface Circle {
    kind: "circle";
    radius: number;
}
 
type KindlessCircle = RemoveKindField<Circle, "kind">;

let Circle: KindlessCircle = {
    kind: "circle"
}

type IsString<T> = T extends string ? true : false;

type x = IsString<'hello'>;
// type x = true

type y = IsString<number>;
// type y = false

type z = IsString<string>;

let y : y = true;