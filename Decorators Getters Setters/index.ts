// ============= DECORATORS (PARAMETER-BASED) =============

interface ParamMetadata {
  index: number;
  name: string;
  type: 'property' | 'readonly';
  logged?: boolean;
  validate?: (value: any) => void | boolean | string;
}

const paramMetadata = new WeakMap<any, ParamMetadata[]>();

// Parameter decorators - decorate constructor parameters directly
function Prop(options: { 
  logged?: boolean, 
  validate?: (value: any) => void | boolean | string 
} = {}) {
  return function (target: any, propertyKey: string | undefined, parameterIndex: number) {
    const params = paramMetadata.get(target) || [];
    
    // Get parameter name from constructor (requires preserving param names)
    const paramNames = getParamNames(target);
    const paramName = paramNames[parameterIndex] || `param${parameterIndex}`;
    
    params.push({
      index: parameterIndex,
      name: paramName,
      type: 'property',
      logged: options.logged,
      validate: options.validate
    });
    
    paramMetadata.set(target, params);
  };
}

function ReadOnly() {
  return function (target: any, propertyKey: string | undefined, parameterIndex: number) {
    const params = paramMetadata.get(target) || [];
    
    const paramNames = getParamNames(target);
    const paramName = paramNames[parameterIndex] || `param${parameterIndex}`;
    
    params.push({
      index: parameterIndex,
      name: paramName,
      type: 'readonly',
    });
    
    paramMetadata.set(target, params);
  };
}

// Extract parameter names from constructor
function getParamNames(func: Function): string[] {
  const funcStr = func.toString();
  const match = funcStr.match(/constructor\s*\(([^)]*)\)/);
  if (!match?.[1]) return [];
  
  return match[1]
    .split(',')
    .map(param => param.trim().split(/[\s:]/)[0])
    .filter((name): name is string => name !== undefined && name.length > 0);
}

// Class decorator that sets up everything
function Accessors<T extends { new(...args: any[]): {} }>(constructor: T) {
  const params = paramMetadata.get(constructor) || [];
  
  const NewClass = class extends constructor {
    constructor(...args: any[]) {
      super(...args);
      
      // Auto-assign values to private properties
      params.forEach(param => {
        const privateKey = `_${param.name}`;
        (this as any)[privateKey] = args[param.index];
      });
    }
  };
  
  // Create accessors on the new class prototype
  params.forEach(param => {
    const privateKey = `_${param.name}`;
    const publicKey = param.name;
    const capitalizedName = publicKey.charAt(0).toUpperCase() + publicKey.slice(1);
    const getterName = `get${capitalizedName}`;
    const setterName = `set${capitalizedName}`;
    
    // Create getter
    (NewClass.prototype as any)[getterName] = function() {
      return (this as any)[privateKey];
    };
    
    // Create setter only if not readonly
    if (param.type === 'property') {
      const logged = param.logged;
      const validate = param.validate;
      (NewClass.prototype as any)[setterName] = function(value: any) {
        // Run validation first (if provided)
        if (validate) {
          const result = validate(value);
          // If returns false or error string, throw error
          if (result === false) {
            throw new Error(`Validation failed for ${publicKey}`);
          } else if (typeof result === 'string') {
            throw new Error(result);
          }
          // If returns void or true, validation passed
        }
        
        if (logged) {
          console.log(`[LOG] Setting ${publicKey}: ${(this as any)[privateKey]} -> ${value}`);
        }
        (this as any)[privateKey] = value;
      };
    }
  });
  
  return NewClass;
}


interface Employee {
  getDepartment(): string;
  setDepartment(value: string): void;
  getSalary(): number;
  setSalary(value: number): void;
  getEmployeeId(): string;
}

@Accessors
class Employee {
  constructor(
    @Prop() department: string,
    @Prop({ logged: true }) salary: number,
    @ReadOnly() employeeId: string
  ) {}
}

interface Person {
  getName(): string;
  setName(value: string): void;
  getAge(): number;
  setAge(value: number): void;
  getId(): string;
}

@Accessors
class Person {
  constructor(
    @Prop() name: string,
    @Prop({ 
      logged: true,
      validate: (value) => {
        if (value < 0) return "Age must be greater than or equal to 0";
        if (value > 150) return "Age must be less than 150";
      }
    }) age: number,
    @ReadOnly() id: string
  ) {}
  
  getInfo(): string {
    return `${this.getName()} is ${this.getAge()} years old`;
  }
}

// ============= TESTING =============

console.log("====== EMPLOYEE CLASS ======\n");
const emp = new Employee("Engineering", 100000, "EMP-001");
console.log("Department:", emp.getDepartment());
console.log("Salary:", emp.getSalary());
console.log("ID:", emp.getEmployeeId());
emp.setSalary(120000); // Logs the change!

console.log("\n====== PERSON CLASS (WITH VALIDATION) ======\n");
const person = new Person("Alice", 30, "ID-12345");
console.log("Name:", person.getName());
console.log("Age:", person.getAge());
person.setAge(35); // Logs and validates!
console.log("Info:", person.getInfo());

// Test validation
console.log("\n====== TESTING VALIDATION ======\n");
try {
  person.setAge(-5); // Should throw error
} catch (e: any) {
  console.log("✓ Caught error:", e.message);
}

try {
  person.setAge(200); // Should throw error
} catch (e: any) {
  console.log("✓ Caught error:", e.message);
}

person.setAge(25); // Should succeed
console.log("✓ Valid age set:", person.getAge());
