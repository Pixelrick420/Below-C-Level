<img width="3188" height="1202" alt="frame (3)" src="https://github.com/user-attachments/assets/517ad8e9-ad22-457d-9538-a9e62d137cd7" />

# Below C Level 🎯

## Basic Details
### Team Name: Below C Level

### Team Members
- Team Lead: Theerttha S - Government Engineering College, Thrissur
- Member 2: Harikrishnan R - Government Engineering College, Thrissur

### Project Description
It is a vscode extension with the following functions:

- Snake Game in Code
A fully interactive snake game runs between your code lines. The snake slithers across your editor, “eating” your code as you play. Control the snake using the arrow keys directly inside VS Code.

- Shakespearean Variable Renamer
All variable names in C and Python files are automatically transformed into over-the-top Shakespearean insults, adding dramatic flair to otherwise boring identifiers.

- Philosopher Comment Generator
Injects pointless yet amusing dialogues between Aristotle and Plato into your code as comments, powered by an API key. Perfect for confusing future readers of your code.
The debates are generated through calls to the groq api.

- Fibonacci Indentation
In Python, nested blocks are indented according to the Fibonacci sequence rather than standard spaces, producing mathematically inspired (and utterly unreadable) formatting.

- Joke Box
Random jokes are displayed as information pop-ups inside VS Code, giving comic relief while coding.

- Subway Surfers Distraction Mode
A looping Subway Surfers gameplay video plays on the right side of the screen, 

### The Problem (that doesn't exist)
Software development environments are traditionally designed for productivity, efficiency, and clean code practices. However, this leaves little room for creativity, humor, or stress-relief for developers who spend long hours inside an editor. Most existing Visual Studio Code extensions focus on utilities such as debugging, linting, formatting, or integrations, but very few extensions combine entertainment, satire, and coding in an interactive way.
This raises the following problems:

Lack of Entertainment in Editors – Editors provide powerful tools for coding but rarely introduce fun, engaging features to reduce burnout.

Monotony of Repeated Code Practices – Naming conventions, comments, and formatting are usually rigid and predictable.

Absence of Humor in Development Tools – While jokes and memes thrive outside coding environments, they are rarely embedded directly into the coding experience.

### The Solution (that nobody asked for)
Interactive Gaming Inside Code: A snake game runs inside the code editor itself, allowing users to control a snake that “eats” code lines. This feature adds an unconventional yet entertaining layer to coding sessions.

Humorous Variable Renaming: In C and Python files, variable names are automatically replaced with Shakespearean insults, breaking away from monotonous identifiers and making code reading a comical experience.

Philosophical Comment Generator: Using an API key, the extension inserts dialogues between Aristotle and Plato as comments, parodying documentation while adding humorous philosophical debates to code.

Mathematical Formatting: Python indentation is modified to follow the Fibonacci sequence instead of uniform spacing, introducing a mathematical twist to an otherwise standard feature.

Lighthearted Notifications: Random jokes appear in VS Code information boxes, providing developers with comic relief during long coding sessions.

Background Distraction Mode: A Subway Surfers gameplay video plays on the right side of the screen, emulating the viral trend of attention-grabbing background content.

## Technical Details
### Technologies/Components Used
For Software:
- Typescript
- Yeoman
- VS Code, dotenv, path, node
- npm, VS Code, Claude, Groq

### Implementation
# Installation
download vscode extension 'below-c-level'

# Run
Use `ctrl + shift + p` and select dashboard to open extension settings.
In dashboard:
- we have name changer with auto change option. user can input the given time in which the variable names are converted to Shakespearean insults.
- there is option to auto spawn the snake game. user can input the chance rate at which snake might appear.
- there is option to auto generate jokes in given time frame taken as input from the user
- there is option to generate indentation with fibonacci sequence for nested blocks

Use `ctrl + shift + p`:
- select 'Below C Level: Get Joke' to activate the get joke feature
- select 'Below C Level: Debate' will generate conversation between Artistotle and Plato using groq api keys
- select 'Below C Level: fibonacci' will indent pythons programs such that successive code blocks in a nested block have number of tabs=successive terms of the fibonacci sequence
- select 'Below C Level: Snake' will start a snake game inside the code editor window. The snake grows as it consumes character of code. The only way to stop it is to consume the death apple
- select 'Below C Level: Shakespearean Code': all variable names in the code will be converted to Shakesperean insults
- select 'Below C Level: Subway Surfers': will start a subway surfers video on the right side of the vscode window

# Screenshots 
<img width="492" height="425" alt="image" src="https://github.com/user-attachments/assets/97a7575d-4dfc-4576-bf3e-156341690b7a" />

*Code editor window after finishing a snake game*


<img width="1590" height="647" alt="image" src="https://github.com/user-attachments/assets/7bd08eb9-20ad-4a49-9653-bd214b1223bf" />

*Code editor window with philosophical debate*


<img width="684" height="768" alt="image" src="https://github.com/user-attachments/assets/2c2d2254-1717-403d-afe6-2cf374f647f6" />

*The extension dashboard showing the vairous user options and settings*


<img width="1063" height="741" alt="image" src="https://github.com/user-attachments/assets/0caa6f40-290b-4949-bd04-a54cf364bcbd" />

*Code editor window showing user defined identifiers in c turned into shakesperian insults*


<img width="594" height="157" alt="image" src="https://github.com/user-attachments/assets/5c626447-d2dc-409b-9d64-725f943e5523" />

*Code editor window showing python code with fibonacci indentation*


<img width="1280" height="645" alt="image" src="https://github.com/user-attachments/assets/52f54b20-4969-4512-b5a4-f90c7580ce7c" />

*Dashboard window showing joke notifications on the bottom right after clicking the tell joke button*


<img width="1280" height="640" alt="image" src="https://github.com/user-attachments/assets/7e00628e-bae8-4a85-a5d0-77285ed7399d" />

*Code editor window showing subway surfers gameplay on the right*


<img width="893" height="488" alt="image" src="https://github.com/user-attachments/assets/371c06fd-542f-4c04-a672-151fe20a34a1" />

*Vs code tab shown after pressing ctrl + shift + p*


## Team Contributions
- Theerttha S: Get Joke, Fibonacci and subway surfers function.
- Harikrishnan R: Comment Generator, Snake Game, Name Changer functions and Logo design

---
Made with ❤️ at TinkerHub Useless Projects 

![Static Badge](https://img.shields.io/badge/TinkerHub-24?color=%23000000&link=https%3A%2F%2Fwww.tinkerhub.org%2F)
![Static Badge](https://img.shields.io/badge/UselessProjects--25-25?link=https%3A%2F%2Fwww.tinkerhub.org%2Fevents%2FQ2Q1TQKX6Q%2FUseless%2520Projects)


