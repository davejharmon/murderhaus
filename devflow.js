const concurrently = require('concurrently');
const waitOn = require('wait-on');
const openModule = require('open');
const open = openModule.default || openModule;

const CLIENT_PORT = 5173;

async function main() {
  try {
    // Start server + client concurrently
    concurrently(
      [
        {
          command: 'node server/index.js',
          name: 'SERVER',
          prefixColor: 'blue',
        },
        {
          command: 'cd client && npm run dev',
          name: 'CLIENT',
          prefixColor: 'green',
        },
      ],
      { killOthers: ['failure', 'success'], restartTries: 0 }
    );

    // Wait for client to be ready
    await waitOn({
      resources: [`http://localhost:${CLIENT_PORT}`],
      timeout: 10000,
    });
    console.log('Client is ready.');

    // Open single Dashboard page
    await open(`http://localhost:${CLIENT_PORT}/dashboard`);
    console.log('Dashboard opened.');
  } catch (err) {
    console.error('Error in devflow:', err);
  }
}

main();
