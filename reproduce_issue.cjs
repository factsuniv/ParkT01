
const fs = require('fs');

try {
  const appContent = fs.readFileSync('./App.tsx', 'utf8');

  // Extract the renderContent function body
  const renderContentRegex = /const renderContent = \(\) => \{([\s\S]*?)\};/;
  const match = appContent.match(renderContentRegex);

  if (match) {
      const body = match[1];
      // Check for presence of consumer states in renderContent
      const handlesMapIdle = body.includes('AppState.MAP_IDLE');
      const handlesSearching = body.includes('AppState.SEARCHING');

      if (!handlesMapIdle) {
          console.log("CONFIRMED: renderContent does not handle MAP_IDLE");
      } else {
          console.log("renderContent handles MAP_IDLE");
      }

      // Check if it returns the default "Loading..." at the end
      if (body.includes('return (') && body.includes('Loading...')) {
           console.log("Default return is Loading...");
      }

  } else {
      console.log("Could not find renderContent function");
  }
} catch (e) {
  console.error("Error reading file:", e);
}
