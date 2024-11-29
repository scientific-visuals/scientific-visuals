import { WcCustomElementRegistry } from '@aurelia/web-components'; // Import your registry implementation
import { DI, Registration  } from '@aurelia/kernel';
import { Aurelia, CustomElement, StandardConfiguration, IPlatform } from '@aurelia/runtime-html';
import {BrowserPlatform} from '@aurelia/platform-browser'

// Create the Aurelia container
const container = DI.createContainer();
container.register(
  Registration.instance(IPlatform, BrowserPlatform.getOrCreate(globalThis)));
// Register the StandardConfiguration
container.register(StandardConfiguration); // This registers core services like IExpressionParser
const registry = container.get(WcCustomElementRegistry);

import { Chartjs } from './components/chartjs';
import { ChartjsScatter } from './components/chartjs-scatter';
import { Table} from './components/table';
import { ChartjsGeo } from './components/chartjs-geo';

registry.define('sv-chartjs', Chartjs);
registry.define('sv-chartjs-scatter', ChartjsScatter);
registry.define('sv-table', Table);
registry.define('sv-chartjs-geo', ChartjsGeo);

// Optionally, export the registry for further use
export { registry };
