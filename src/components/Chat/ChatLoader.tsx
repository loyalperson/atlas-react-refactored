import { IconRobot } from '@tabler/icons-react';
import { FC } from 'react';

interface Props { }

export const ChatLoader: FC<Props> = () => {
  return (
    <div
      className="group border-b border-black/10 bg-gray-50 text-gray-800 dark:border-gray-900/50 bg-light-green dark:bg-light-green"
      style={{ overflowWrap: 'anywhere' }}
    >
      <div className="m-auto flex gap-4 p-4 text-base md:max-w-2xl md:gap-6 md:py-6 lg:max-w-2xl lg:px-0 xl:max-w-3xl">
        <div className="min-w-[40px] items-end">
        <img 
  src="https://www.dropbox.com/scl/fi/yh2sb21oqn3bj5f5t4teu/Screenshot_2023-11-11_at_7.47.34_PM-removebg-preview.png?rlkey=10djlurjsew8s9e11qfh8f2ft&raw=1" 
  alt="Robot Icon" 
  style={{ width: 30, height: 30 }} // Set the size of the image
/>
        </div>
        <span className="animate-pulse cursor-default mt-1">▍</span>
      </div>
    </div>
  );
};
