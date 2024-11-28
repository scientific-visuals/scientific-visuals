import { WcCustomElementRegistry } from '@aurelia/web-components'; // Import your registry implementation

import { DI, Registration  } from '@aurelia/kernel';
import { Aurelia, CustomElement, StandardConfiguration, IPlatform } from '@aurelia/runtime-html';
//import { ITaskQueue, TaskQueue } from '@aurelia/runtime-html';

import { Chartjs } from './components/chartjs';
import { ChartjsScatter } from './components/chartjs-scatter';
import { Table} from './components/table';
import { ChartjsGeo } from './components/chartjs-geo';
import { Chart } from 'chart.js';


// Create the Aurelia container
const container = DI.createContainer();
const platform = window;
container.register(Registration.instance(IPlatform, platform));
// Register the StandardConfiguration
container.register(StandardConfiguration); // This registers core services like IExpressionParser
// Register the Task Queue manually
//container.register(Registration.singleton(TaskQueue));

// Provide a dummy app root to avoid AUR0770
const dummyApp = CustomElement.define({
  name: 'dummy-app',
  template: '',
});
// Start Aurelia with a dummy app root
const aurelia = new Aurelia(container);
aurelia
  .register(Chartjs)
  .register(ChartjsScatter)
  .register(Table)
  .register(ChartjsGeo)
  .app({ host: document.createElement('div'), component: dummyApp });
aurelia.start();

// Define the web components
//const registry = new WcCustomElementRegistry(); // Instantiate the registry
// Provide the container to WcCustomElementRegistry
const registry = container.get(WcCustomElementRegistry);

registry.define('sv-chartjs', Chartjs);
registry.define('sv-chartjs-scatter', ChartjsScatter);
registry.define('sv-table', Table);
registry.define('sv-chartjs-geo', ChartjsGeo);


// Optionally, export the registry for further use
export { registry };
