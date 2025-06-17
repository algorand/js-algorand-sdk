function injectConstructorMarker(source, className, markerProperty) {
  const constructorMarker = `
    // @ts-ignore - Add unique identifier for cross-module instanceof compatibility
    this.${markerProperty} = true;`;

  // Try to find existing constructor
  const constructorPattern =
    /(constructor\s*\([^)]*\)\s*{)([^}]*(?:{[^}]*}[^}]*)*)(})/g;

  const constructorMatch = constructorPattern.exec(source);

  if (constructorMatch) {
    // Constructor exists - inject marker at the beginning
    const updatedConstructor = `${constructorMatch[1]}${constructorMarker}${constructorMatch[2]}${constructorMatch[3]}`;
    return source.replace(constructorMatch[0], updatedConstructor);
  }
  // No constructor found - create a default one
  const defaultConstructor = `
  constructor(...args: any[]) {
    super(...args);${constructorMarker}
  }`;

  // Find class opening brace and insert constructor - account for export keyword
  const classPattern = new RegExp(
    `((?:export\\s+)?class\\s+${className}\\s*(?:extends\\s+[^{]+)?\\s*{)`,
    'g'
  );
  return source.replace(classPattern, `$1${defaultConstructor}`);
}

function processClass(source, className, markerProperty) {
  // Check if class exists - account for export keyword
  const classPattern = new RegExp(
    `(?:export\\s+)?class\\s+${className}\\s*(?:extends\\s+[^{]+)?\\s*{`,
    'g'
  );
  const classMatch = classPattern.exec(source);

  if (!classMatch) {
    return source; // Class not found in this file
  }

  let modifiedSource = source;

  // 1. Inject Symbol.hasInstance method with TypeScript ignore
  const hasInstanceMethod = `
  // @ts-ignore - Custom Symbol.hasInstance for cross-module instanceof compatibility
  static [Symbol.hasInstance](instance: any) {
    // Check for unique property marker instead of prototype chain
    return instance && instance.${markerProperty} === true;
  }`;

  const classReplacement = `${classMatch[0]}${hasInstanceMethod}`;
  modifiedSource = modifiedSource.replace(classMatch[0], classReplacement);

  // 2. Handle constructor injection
  modifiedSource = injectConstructorMarker(
    modifiedSource,
    className,
    markerProperty
  );

  return modifiedSource;
}

module.exports = function (source) {
  let modifiedSource = source;

  // Process each class type
  modifiedSource = processClass(modifiedSource, 'Address', '_isAlgosdkAddress');
  modifiedSource = processClass(
    modifiedSource,
    'Transaction',
    '_isAlgosdkTransaction'
  );

  return modifiedSource;
};
