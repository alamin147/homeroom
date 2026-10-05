import { AppShell } from "./app/layout/AppShell";
import { registerFeatures } from "./registry/registerFeatures";
import { installActivityRecorder } from "./providers/activity/activityProvider";
import { migrateLegacyDemoData } from "./shared/services/dataMigrations";

migrateLegacyDemoData();
registerFeatures();
installActivityRecorder();

export default function App() {
  return <AppShell />;
}
