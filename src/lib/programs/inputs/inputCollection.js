/**
 * Collection of input bindings. Individual program works with this collection
 * to command it update texture bindings.
 */
export default function createInputCollection() {
  var boundInputs = new Map() 
  var currentProgram;
  return {
    updateBindings,
    bindInput,
  }

  function bindInput(inputIndex, inputBinding) {
    var prevBinding = boundInputs.get(inputIndex);
    if (prevBinding) {
      prevBinding.dispose();
    }
    boundInputs.set(inputIndex, inputBinding);
  }

  function updateBindings(program) {
    currentProgram = program;
    boundInputs.forEach(updateInputBinding);
  }

  function updateInputBinding(input, inputIndex) {
    input.updateBinding(currentProgram, inputIndex);
  }
}