import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { LabSubject, LabCode, CodeExecutionRequest, CodeExecutionResult, ProgrammingLanguage } from '@semprepzie/shared';
import { logger } from '../utils/logger';

// In-memory storage (in production, use a database)
let labSubjects: LabSubject[] = [
  {
    id: 'python-basics',
    name: 'Python Programming Basics',
    description: 'Learn Python fundamentals with data science libraries',
    language: 'python',
    codes: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'admin',
    isActive: true
  },
  {
    id: 'c-programming',
    name: 'C Programming',
    description: 'Master C programming language fundamentals',
    language: 'c',
    codes: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'admin',
    isActive: true
  },
  {
    id: 'java-basics',
    name: 'Java Programming',
    description: 'Object-oriented programming with Java',
    language: 'java',
    codes: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'admin',
    isActive: true
  }
];

let labCodes: LabCode[] = [
  // Python codes
  {
    id: 'python-hello',
    title: 'Hello World with Data Science',
    description: 'Introduction to Python with NumPy and Pandas',
    code: `# Python with Data Science Libraries
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

print("Hello, Python World!")
print("===================")

# NumPy example
arr = np.array([1, 2, 3, 4, 5])
print(f"NumPy array: {arr}")
print(f"Array sum: {np.sum(arr)}")
print(f"Array mean: {np.mean(arr)}")

# Pandas example
data = {'Name': ['Alice', 'Bob', 'Charlie'], 'Age': [25, 30, 35]}
df = pd.DataFrame(data)
print("\\nPandas DataFrame:")
print(df)

print("\\nPython is ready for data science!")`,
    language: 'python',
    subjectId: 'python-basics',
    isTemplate: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'admin',
    tags: ['basics', 'numpy', 'pandas', 'hello-world']
  },
  {
    id: 'python-calculator',
    title: 'Simple Calculator',
    description: 'Build a calculator using Python',
    code: `# Simple Calculator in Python
import math

def add(x, y):
    return x + y

def subtract(x, y):
    return x - y

def multiply(x, y):
    return x * y

def divide(x, y):
    if y != 0:
        return x / y
    else:
        return "Error: Division by zero!"

def power(x, y):
    return math.pow(x, y)

def square_root(x):
    if x >= 0:
        return math.sqrt(x)
    else:
        return "Error: Cannot take square root of negative number!"

# Test the calculator
print("Python Calculator")
print("================")

a, b = 10, 3

print(f"Addition: {a} + {b} = {add(a, b)}")
print(f"Subtraction: {a} - {b} = {subtract(a, b)}")
print(f"Multiplication: {a} * {b} = {multiply(a, b)}")
print(f"Division: {a} / {b} = {divide(a, b)}")
print(f"Power: {a} ^ {b} = {power(a, b)}")
print(f"Square root of {a} = {square_root(a)}")

# Data visualization example
import matplotlib.pyplot as plt
import numpy as np

x = np.linspace(0, 10, 100)
y = np.sin(x)

print("\\nGenerating sine wave plot...")
print("Plot would be displayed if matplotlib GUI was available")`,
    language: 'python',
    subjectId: 'python-basics',
    isTemplate: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'admin',
    tags: ['calculator', 'math', 'functions']
  },
  // C codes
  {
    id: 'c-hello',
    title: 'Hello World in C',
    description: 'Your first C program',
    code: `#include <stdio.h>
#include <stdlib.h>

int main() {
    printf("Hello, C Programming World!\\n");
    printf("===========================\\n");
    
    printf("Welcome to C programming lab!\\n");
    printf("C is a powerful systems programming language.\\n");
    
    return 0;
}`,
    language: 'c',
    subjectId: 'c-programming',
    isTemplate: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'admin',
    tags: ['hello-world', 'basics']
  },
  {
    id: 'c-calculator',
    title: 'C Calculator',
    description: 'Simple calculator in C',
    code: `#include <stdio.h>
#include <math.h>

// Function declarations
float add(float a, float b);
float subtract(float a, float b);
float multiply(float a, float b);
float divide(float a, float b);

int main() {
    float num1 = 15.5, num2 = 4.2;
    
    printf("C Programming Calculator\\n");
    printf("=======================\\n");
    
    printf("Number 1: %.2f\\n", num1);
    printf("Number 2: %.2f\\n", num2);
    printf("\\n");
    
    printf("Addition: %.2f + %.2f = %.2f\\n", num1, num2, add(num1, num2));
    printf("Subtraction: %.2f - %.2f = %.2f\\n", num1, num2, subtract(num1, num2));
    printf("Multiplication: %.2f * %.2f = %.2f\\n", num1, num2, multiply(num1, num2));
    printf("Division: %.2f / %.2f = %.2f\\n", num1, num2, divide(num1, num2));
    printf("Square root of %.2f = %.2f\\n", num1, sqrt(num1));
    
    return 0;
}

// Function definitions
float add(float a, float b) {
    return a + b;
}

float subtract(float a, float b) {
    return a - b;
}

float multiply(float a, float b) {
    return a * b;
}

float divide(float a, float b) {
    if (b != 0) {
        return a / b;
    } else {
        printf("Error: Division by zero!\\n");
        return 0;
    }
}`,
    language: 'c',
    subjectId: 'c-programming',
    isTemplate: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'admin',
    tags: ['calculator', 'math', 'functions']
  },
  // Java codes
  {
    id: 'java-hello',
    title: 'Hello World in Java',
    description: 'Your first Java program',
    code: `public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, Java Programming World!");
        System.out.println("===============================");
        
        System.out.println("Welcome to Java programming lab!");
        System.out.println("Java is a versatile, object-oriented language.");
        
        // Variables demonstration
        String language = "Java";
        int year = 1995;
        boolean isPopular = true;
        
        System.out.println("\\nLanguage: " + language);
        System.out.println("Created in: " + year);
        System.out.println("Is popular: " + isPopular);
        
        // Simple calculation
        int a = 10, b = 20;
        int sum = a + b;
        System.out.println("\\n" + a + " + " + b + " = " + sum);
    }
}`,
    language: 'java',
    subjectId: 'java-basics',
    isTemplate: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'admin',
    tags: ['hello-world', 'basics', 'variables']
  },
  {
    id: 'java-calculator',
    title: 'Java Calculator Class',
    description: 'Object-oriented calculator in Java',
    code: `import java.util.Scanner;

class Calculator {
    // Method for addition
    public double add(double a, double b) {
        return a + b;
    }
    
    // Method for subtraction
    public double subtract(double a, double b) {
        return a - b;
    }
    
    // Method for multiplication
    public double multiply(double a, double b) {
        return a * b;
    }
    
    // Method for division
    public double divide(double a, double b) {
        if (b != 0) {
            return a / b;
        } else {
            System.out.println("Error: Division by zero!");
            return 0;
        }
    }
    
    // Method for power
    public double power(double base, double exponent) {
        return Math.pow(base, exponent);
    }
    
    // Method for square root
    public double squareRoot(double number) {
        if (number >= 0) {
            return Math.sqrt(number);
        } else {
            System.out.println("Error: Cannot calculate square root of negative number!");
            return 0;
        }
    }
}

public class Main {
    public static void main(String[] args) {
        Calculator calc = new Calculator();
        
        System.out.println("Java Calculator");
        System.out.println("===============");
        
        double x = 12.5;
        double y = 4.0;
        
        System.out.println("Number 1: " + x);
        System.out.println("Number 2: " + y);
        System.out.println();
        
        System.out.println("Addition: " + x + " + " + y + " = " + calc.add(x, y));
        System.out.println("Subtraction: " + x + " - " + y + " = " + calc.subtract(x, y));
        System.out.println("Multiplication: " + x + " * " + y + " = " + calc.multiply(x, y));
        System.out.println("Division: " + x + " / " + y + " = " + calc.divide(x, y));
        System.out.println("Power: " + x + " ^ " + y + " = " + calc.power(x, y));
        System.out.println("Square root of " + x + " = " + calc.squareRoot(x));
    }
}`,
    language: 'java',
    subjectId: 'java-basics',
    isTemplate: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'admin',
    tags: ['calculator', 'oop', 'classes', 'methods']
  }
];

// Link codes to subjects
labSubjects.forEach(subject => {
  subject.codes = labCodes.filter(code => code.subjectId === subject.id);
});

class LabController {
  // Get all lab subjects
  async getSubjects(req: Request, res: Response) {
    try {
      const subjects = labSubjects.filter(subject => subject.isActive);
      res.json({
        success: true,
        data: subjects
      });
    } catch (error) {
      logger.error('Error fetching lab subjects:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch lab subjects'
      });
    }
  }

  // Get specific lab subject
  async getSubject(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const subject = labSubjects.find(s => s.id === id && s.isActive);
      
      if (!subject) {
        return res.status(404).json({
          success: false,
          error: 'Lab subject not found'
        });
      }

      // Get codes for this subject
      const codes = labCodes.filter(code => code.subjectId === id);
      const subjectWithCodes = { ...subject, codes };

      res.json({
        success: true,
        data: subjectWithCodes
      });
    } catch (error) {
      logger.error('Error fetching lab subject:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch lab subject'
      });
    }
  }

  // Create lab subject (Admin only)
  async createSubject(req: Request, res: Response) {
    try {
      const { role } = req.user as any;
      
      if (role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: 'Only admins can create lab subjects'
        });
      }

      const { name, description, language } = req.body;
      
      if (!name || !description || !language) {
        return res.status(400).json({
          success: false,
          error: 'Name, description, and language are required'
        });
      }

      const newSubject: LabSubject = {
        id: uuidv4(),
        name,
        description,
        language: language as ProgrammingLanguage,
        codes: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: req.user?.uid || '',
        isActive: true
      };

      labSubjects.push(newSubject);

      res.status(201).json({
        success: true,
        data: newSubject,
        message: 'Lab subject created successfully'
      });
    } catch (error) {
      logger.error('Error creating lab subject:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create lab subject'
      });
    }
  }

  // Update lab subject (Admin only)
  async updateSubject(req: Request, res: Response) {
    try {
      const { role } = req.user as any;
      
      if (role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: 'Only admins can update lab subjects'
        });
      }

      const { id } = req.params;
      const { name, description, language } = req.body;
      
      const subjectIndex = labSubjects.findIndex(s => s.id === id);
      
      if (subjectIndex === -1) {
        return res.status(404).json({
          success: false,
          error: 'Lab subject not found'
        });
      }

      labSubjects[subjectIndex] = {
        ...labSubjects[subjectIndex],
        name: name || labSubjects[subjectIndex].name,
        description: description || labSubjects[subjectIndex].description,
        language: language || labSubjects[subjectIndex].language,
        updatedAt: new Date().toISOString()
      };

      res.json({
        success: true,
        data: labSubjects[subjectIndex],
        message: 'Lab subject updated successfully'
      });
    } catch (error) {
      logger.error('Error updating lab subject:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update lab subject'
      });
    }
  }

  // Delete lab subject (Admin only)
  async deleteSubject(req: Request, res: Response) {
    try {
      const { role } = req.user as any;
      
      if (role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: 'Only admins can delete lab subjects'
        });
      }

      const { id } = req.params;
      const subjectIndex = labSubjects.findIndex(s => s.id === id);
      
      if (subjectIndex === -1) {
        return res.status(404).json({
          success: false,
          error: 'Lab subject not found'
        });
      }

      // Soft delete
      labSubjects[subjectIndex].isActive = false;
      labSubjects[subjectIndex].updatedAt = new Date().toISOString();

      res.json({
        success: true,
        message: 'Lab subject deleted successfully'
      });
    } catch (error) {
      logger.error('Error deleting lab subject:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete lab subject'
      });
    }
  }

  // Get specific code
  async getCode(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const code = labCodes.find(c => c.id === id);
      
      if (!code) {
        return res.status(404).json({
          success: false,
          error: 'Code not found'
        });
      }

      res.json({
        success: true,
        data: code
      });
    } catch (error) {
      logger.error('Error fetching code:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch code'
      });
    }
  }

  // Save code (Admin only)
  async saveCode(req: Request, res: Response) {
    try {
      const { role } = req.user as any;
      
      if (role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: 'Only admins can save code'
        });
      }

      const { title, description, code, language, subjectId, tags = [], isTemplate = false } = req.body;
      
      if (!title || !code || !language || !subjectId) {
        return res.status(400).json({
          success: false,
          error: 'Title, code, language, and subjectId are required'
        });
      }

      const newCode: LabCode = {
        id: uuidv4(),
        title,
        description,
        code,
        language: language as ProgrammingLanguage,
        subjectId,
        isTemplate,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: req.user?.uid || '',
        tags: Array.isArray(tags) ? tags : []
      };

      labCodes.push(newCode);

      res.status(201).json({
        success: true,
        data: newCode,
        message: 'Code saved successfully'
      });
    } catch (error) {
      logger.error('Error saving code:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to save code'
      });
    }
  }

  // Execute code
  async executeCode(req: Request, res: Response) {
    try {
      const { code, language, input = '' }: CodeExecutionRequest = req.body;
      
      if (!code || !language) {
        return res.status(400).json({
          success: false,
          error: 'Code and language are required'
        });
      }

      const result = await this.runCode(code, language, input);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Error executing code:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to execute code'
      });
    }
  }

  // Private method to execute code
  private async runCode(code: string, language: ProgrammingLanguage, input: string): Promise<CodeExecutionResult> {
    const startTime = Date.now();
    const tempDir = path.join(__dirname, '../../temp');
    
    try {
      // Ensure temp directory exists
      await fs.mkdir(tempDir, { recursive: true });
      
      let result: CodeExecutionResult;

      switch (language) {
        case 'python':
          result = await this.runPython(code, input, tempDir);
          break;
        case 'c':
          result = await this.runC(code, input, tempDir);
          break;
        case 'java':
          result = await this.runJava(code, input, tempDir);
          break;
        default:
          throw new Error(`Unsupported language: ${language}`);
      }

      result.executionTime = Date.now() - startTime;
      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown execution error',
        executionTime: Date.now() - startTime
      };
    }
  }

  private async runPython(code: string, input: string, tempDir: string): Promise<CodeExecutionResult> {
    const fileName = `temp_${Date.now()}.py`;
    const filePath = path.join(tempDir, fileName);
    
    try {
      await fs.writeFile(filePath, code);
      
      return new Promise((resolve) => {
        const child = spawn('python3', [filePath], {
          cwd: tempDir,
          timeout: 30000
        });

        let output = '';
        let error = '';

        child.stdout.on('data', (data) => {
          output += data.toString();
        });

        child.stderr.on('data', (data) => {
          error += data.toString();
        });

        if (input) {
          child.stdin.write(input);
          child.stdin.end();
        }

        child.on('close', async (code) => {
          // Clean up
          try {
            await fs.unlink(filePath);
          } catch (e) {
            // Ignore cleanup errors
          }

          if (code === 0) {
            resolve({
              success: true,
              output: output.trim(),
              executionTime: 0
            });
          } else {
            resolve({
              success: false,
              error: error.trim() || 'Process exited with non-zero code',
              executionTime: 0
            });
          }
        });

        child.on('error', async (err) => {
          try {
            await fs.unlink(filePath);
          } catch (e) {
            // Ignore cleanup errors
          }
          
          resolve({
            success: false,
            error: err.message,
            executionTime: 0
          });
        });
      });
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create Python file',
        executionTime: 0
      };
    }
  }

  private async runC(code: string, input: string, tempDir: string): Promise<CodeExecutionResult> {
    const fileName = `temp_${Date.now()}`;
    const sourceFile = path.join(tempDir, `${fileName}.c`);
    const execFile = path.join(tempDir, fileName);
    
    try {
      await fs.writeFile(sourceFile, code);
      
      return new Promise((resolve) => {
        // Compile first
        const compiler = spawn('gcc', [sourceFile, '-o', execFile], {
          cwd: tempDir,
          timeout: 15000
        });

        let compileError = '';

        compiler.stderr.on('data', (data) => {
          compileError += data.toString();
        });

        compiler.on('close', async (code) => {
          if (code !== 0) {
            // Clean up
            try {
              await fs.unlink(sourceFile);
            } catch (e) {
              // Ignore
            }
            
            resolve({
              success: false,
              error: compileError.trim() || 'Compilation failed',
              executionTime: 0
            });
            return;
          }

          // Execute compiled program
          const child = spawn(execFile, [], {
            cwd: tempDir,
            timeout: 30000
          });

          let output = '';
          let runtimeError = '';

          child.stdout.on('data', (data) => {
            output += data.toString();
          });

          child.stderr.on('data', (data) => {
            runtimeError += data.toString();
          });

          if (input) {
            child.stdin.write(input);
            child.stdin.end();
          }

          child.on('close', async (exitCode) => {
            // Clean up
            try {
              await fs.unlink(sourceFile);
              await fs.unlink(execFile);
            } catch (e) {
              // Ignore cleanup errors
            }

            if (exitCode === 0) {
              resolve({
                success: true,
                output: output.trim(),
                executionTime: 0
              });
            } else {
              resolve({
                success: false,
                error: runtimeError.trim() || 'Process exited with non-zero code',
                executionTime: 0
              });
            }
          });

          child.on('error', async (err) => {
            try {
              await fs.unlink(sourceFile);
              await fs.unlink(execFile);
            } catch (e) {
              // Ignore cleanup errors
            }
            
            resolve({
              success: false,
              error: err.message,
              executionTime: 0
            });
          });
        });
      });
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create C file',
        executionTime: 0
      };
    }
  }

  private async runJava(code: string, input: string, tempDir: string): Promise<CodeExecutionResult> {
    // Extract class name from code
    const classNameMatch = code.match(/public\s+class\s+(\w+)/);
    const className = classNameMatch ? classNameMatch[1] : 'Main';
    
    const fileName = `${className}.java`;
    const filePath = path.join(tempDir, fileName);
    
    try {
      await fs.writeFile(filePath, code);
      
      return new Promise((resolve) => {
        // Compile first
        const compiler = spawn('javac', [fileName], {
          cwd: tempDir,
          timeout: 15000
        });

        let compileError = '';

        compiler.stderr.on('data', (data) => {
          compileError += data.toString();
        });

        compiler.on('close', async (exitCode) => {
          if (exitCode !== 0) {
            // Clean up
            try {
              await fs.unlink(filePath);
            } catch (e) {
              // Ignore
            }
            
            resolve({
              success: false,
              error: compileError.trim() || 'Compilation failed',
              executionTime: 0
            });
            return;
          }

          // Execute compiled program
          const child = spawn('java', [className], {
            cwd: tempDir,
            timeout: 30000
          });

          let output = '';
          let runtimeError = '';

          child.stdout.on('data', (data) => {
            output += data.toString();
          });

          child.stderr.on('data', (data) => {
            runtimeError += data.toString();
          });

          if (input) {
            child.stdin.write(input);
            child.stdin.end();
          }

          child.on('close', async (exitCode) => {
            // Clean up
            try {
              await fs.unlink(filePath);
              await fs.unlink(path.join(tempDir, `${className}.class`));
            } catch (e) {
              // Ignore cleanup errors
            }

            if (exitCode === 0) {
              resolve({
                success: true,
                output: output.trim(),
                executionTime: 0
              });
            } else {
              resolve({
                success: false,
                error: runtimeError.trim() || 'Process exited with non-zero code',
                executionTime: 0
              });
            }
          });

          child.on('error', async (err) => {
            try {
              await fs.unlink(filePath);
              await fs.unlink(path.join(tempDir, `${className}.class`));
            } catch (e) {
              // Ignore cleanup errors
            }
            
            resolve({
              success: false,
              error: err.message,
              executionTime: 0
            });
          });
        });
      });
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create Java file',
        executionTime: 0
      };
    }
  }
}

export const labController = new LabController();