import React, { useMemo } from 'react';
import { Button } from './Button';
import { HOST_CONTROLS } from '@shared/constants';
import { send } from '../ws';
import styles from './HostControls.module.css';
import { useSlides } from '../hooks/useSlides';

export default function HostControls({
  metaphase,
  activeEvents = [],
  availableEvents = [],
}) {
  const { buffer, active } = useSlides();
  const hostContext = useMemo(
    () => ({
      metaphase,
      buffer,
      active,
    }),
    [metaphase, buffer, active]
  );
  console.log(hostContext);
  const hostButtons = useMemo(() => {
    return Object.values(HOST_CONTROLS)
      .filter(
        (control) => control.type === 'game' && control.condition(hostContext)
      )
      .map((control) => ({
        id: control.id,
        label: control.label,
        onClick: () => send('HOST_CONTROL', { id: control.id }),
      }));
  }, [hostContext]);

  const hasEvents = activeEvents.length + availableEvents.length > 0;

  return (
    <div className={styles.hostControls}>
      <div className={styles.globalControls}>
        {hostButtons.map((btn) => (
          <Button
            key={btn.id}
            label={btn.label}
            onClick={btn.onClick}
            state='enabled'
          />
        ))}
      </div>

      {hasEvents && (
        <div className={styles.selectionControls}>
          {/* {hostEventButtons.map((btn, i) => (
            <Button
              key={btn.label + i}
              label={btn.label}
              onClick={btn.onClick || (() => {})}
              state={btn.state}
            />
          ))} */}
          <Button key={1} label={'VOTE'} /> {/* DEBUG */}
        </div>
      )}
    </div>
  );
}
