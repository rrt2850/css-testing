import './App.css';
import MovableCharacter from './Components/General/MovableCharacter';
import { UniqueIdProvider } from './Components/General/UniqueIdProvider';

function App() {
  return (
    <UniqueIdProvider>
        <MovableCharacter/>
    </UniqueIdProvider>
  );
}

export default App;
