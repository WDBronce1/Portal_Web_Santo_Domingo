import React from 'react';
import { IonContent, IonPage } from '@ionic/react';
import Navbar from './Navbar';

interface Props {
  children: React.ReactNode;
}

/** Envoltorio común: navbar superior, contenido con espacio para la tabbar móvil. */
const PageShell: React.FC<Props> = ({ children }) => (
  <IonPage>
    <Navbar />
    <IonContent fullscreen className="ion-padding sd-has-tabbar">
      <div className="sd-container" style={{ paddingTop: 12, paddingBottom: 24 }}>
        {children}
      </div>
    </IonContent>
  </IonPage>
);

export default PageShell;
