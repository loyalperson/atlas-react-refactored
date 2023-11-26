import {
  MutableRefObject,
  memo,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import toast from 'react-hot-toast';
import axios from 'axios';
import '../../styles/globals.css';
import '../../styles/custom.css';
import { getEndpoint } from '../../utils/app/api';
import {
  saveConversation,
  saveConversations,
} from '../../utils/app/conversation';
import { throttle } from '../../utils/data/throttle';

import { ChatBody, Conversation, Message } from '../../types/chat';

import HomeContext from '../../utils/context/home.context';

import { ChatInput } from '../../components/Chat/ChatInput';
import { ChatLoader } from '../../components/Chat/ChatLoader';
import { MemoizedChatMessage } from '../../components/Chat/MemoizedChatMessage';

interface Props {
  stopConversationRef: MutableRefObject<boolean>;
}

export const Chat = memo(({ stopConversationRef }: Props) => {

  const {
    state: {
      selectedConversation,
      conversations,
      models,
      apiKey,
      serverSideApiKeyIsSet,
      messageIsStreaming,
      modelError,
      loading,
      prompts,
    },
    handleUpdateConversation,
    dispatch: homeDispatch,
  } = useContext(HomeContext);

  const [currentMessage, setCurrentMessage] = useState<Message>();
  const [autoScrollEnabled, setAutoScrollEnabled] = useState<boolean>(true);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showScrollDownButton, setShowScrollDownButton] = useState<boolean>(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [typingIndicator, setTypingIndicator] = useState('Typing');
  const [isTyping, setIsTyping] = useState(false);
  const typingIndicators = ['Typing', 'Typing.', 'Typing..', 'Typing...'];
  let typingInterval: NodeJS.Timeout | null = null;

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };
  

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isTyping) {
      typingInterval = setInterval(updateTypingIndicator, 500);
    } else {
      resetTypingIndicator();
      if (typingInterval) {
        clearInterval(typingInterval);
      }
    }
  
    return () => {
      if (typingInterval) {
        clearInterval(typingInterval);
      }
    };
  }, [isTyping]);

  const handleSend = useCallback(
    async (message: Message, deleteCount = 0) => {
      setIsTyping(true);
      console.log(
        '🚀 ~ file: Chat.tsx:73 ~ async(message:Message,deleteCount ~ message:',
        message,
      );
      console.log(
        '🚀 ~ file: Chat.tsx:78 ~ async(message:Message,deleteCount ~ selectedConversation:',
        selectedConversation,
      );
      if (selectedConversation) {
        let updatedConversation: Conversation;
        if (deleteCount) {
          const updatedMessages = [...selectedConversation.messages];
          for (let i = 0; i < deleteCount; i++) {
            updatedMessages.pop();
          }
          updatedConversation = {
            ...selectedConversation,
            messages: [...updatedMessages, message],
          };
        } else {
          updatedConversation = {
            ...selectedConversation,
            messages: [...selectedConversation.messages, message],
          };
        }
        homeDispatch({
          field: 'selectedConversation',
          value: updatedConversation,
        });
        homeDispatch({ field: 'loading', value: true });
        homeDispatch({ field: 'messageIsStreaming', value: true });
        
        homeDispatch({ field: 'loading', value: false });
        homeDispatch({ field: 'messageIsStreaming', value: false });

        const endpoint = "https://atlaspro-a6a906d6e540.herokuapp.com/get_response";
        let body: any;
        const elevation = localStorage.getItem('Elevation') || '10m';
        const parcelData = localStorage.getItem('parcelData') || '';
        const incomeData = localStorage.getItem('incomeData') || '';
        const address = localStorage.getItem('Address') || '';
        body = {messages: [message.content], address:address, elevation: elevation, parcelData: JSON.parse(parcelData), incomeData: JSON.parse(incomeData)}
        // body = {messages: updatedConversation.messages, address:address, elevation: elevation, parcelData: parcelData, incomeData: incomeData}
        
        console.log('----->parcelData', parcelData);
        console.log('----->body', body);
        const get_response = await axios.post(endpoint, body);
        console.log('------response_data', get_response.data);
        setIsTyping(false);
        resetTypingIndicator();

        updatedConversation['messages'] = updatedConversation['messages'].concat([{role: 'assistant', content: get_response.data}]);

        saveConversation(updatedConversation);
        const updatedConversations: Conversation[] = conversations.map(
          (conversation) => {
            if (conversation.id === selectedConversation.id) {
              return updatedConversation;
            }
            return conversation;
          },
        );
        if (updatedConversations.length === 0) {
          updatedConversations.push(updatedConversation);
        }
        homeDispatch({ field: 'conversations', value: updatedConversations });
        saveConversations(updatedConversations);
        homeDispatch({ field: 'messageIsStreaming', value: false });
      }
    },
    [
      apiKey,
      conversations,
      selectedConversation,
      stopConversationRef,
    ],
  );

  const updateTypingIndicator = () => {
    setTypingIndicator((prevIndicator) => {
      const currentIndex = typingIndicators.indexOf(prevIndicator);
      const nextIndex = (currentIndex + 1) % typingIndicators.length;
      return typingIndicators[nextIndex];
    });
  };

  const resetTypingIndicator = () => {
    setTypingIndicator('Typing');
  };

  const scrollToBottom = useCallback(() => {
    if (autoScrollEnabled) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      textareaRef.current?.focus();
    }
  }, [autoScrollEnabled]);

  const handleScroll = () => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } =
        chatContainerRef.current;
      const bottomTolerance = 30;

      if (scrollTop + clientHeight < scrollHeight - bottomTolerance) {
        setAutoScrollEnabled(false);
        setShowScrollDownButton(true);
      } else {
        setAutoScrollEnabled(true);
        setShowScrollDownButton(false);
      }
    }
  };

  const handleScrollDown = () => {
    chatContainerRef.current?.scrollTo({
      top: chatContainerRef.current.scrollHeight,
      behavior: 'smooth',
    });
  };

  const scrollDown = () => {
    if (autoScrollEnabled) {
      messagesEndRef.current?.scrollIntoView(true);
    }
  };
  const throttledScrollDown = throttle(scrollDown, 250);

  useEffect(() => {
    throttledScrollDown();
    selectedConversation &&
      setCurrentMessage(
        selectedConversation.messages[selectedConversation.messages.length - 2],
      );
  }, [selectedConversation, throttledScrollDown]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setAutoScrollEnabled(entry.isIntersecting);
        if (entry.isIntersecting) {
          textareaRef.current?.focus();
        }
      },
      {
        root: null,
        threshold: 0.5,
      },
    );
    const messagesEndElement = messagesEndRef.current;
    if (messagesEndElement) {
      observer.observe(messagesEndElement);
    }
    return () => {
      if (messagesEndElement) {
        observer.unobserve(messagesEndElement);
      }
    };
  }, [messagesEndRef]);

  return (
    <div className="relative flex-1 overflow-hidden  bg-light-green dark:bg-light-green">
      <>
        <div
          className="max-h-full overflow-x-hidden"
          ref={chatContainerRef}
          onScroll={handleScroll}
        >
          <div className="mx-auto flex flex-col space-y-5 md:space-y-10 px-3 pt-5 md:pt-12 sm:max-w-[600px]">
            <div className="text-center">
              <img
                src="https://www.dropbox.com/scl/fi/ensej1l64crnkpsmy2kbi/atlaspro-light-logo-1.png?rlkey=t18h2pq0lez222klradjj8fy9&raw=1"
                alt="Atlas Pro Intelligence Logo"
                className="mx-auto" // Adjust the class as needed for styling
              />
            </div>
          </div>

          {selectedConversation?.messages.map((message, index) => (
            <MemoizedChatMessage
              key={index}
              message={message}
              messageIndex={index}
              onEdit={(editedMessage) => {
                setCurrentMessage(editedMessage);
                // discard edited message and the ones that come after then resend
                handleSend(
                  editedMessage,
                  selectedConversation?.messages.length - index,
                );
              }}
            />
          ))}

          {loading && <ChatLoader />}

          {isTyping && 
            <div style={{marginTop:'10px', display:'flex', color:'#e5e7eb'}}>
                <img 
                  src="https://www.dropbox.com/scl/fi/yh2sb21oqn3bj5f5t4teu/Screenshot_2023-11-11_at_7.47.34_PM-removebg-preview.png?rlkey=10djlurjsew8s9e11qfh8f2ft&raw=1" 
                  alt="Robot Icon" 
                  style={{marginLeft:'18px', width: 30, height: 30 }} // Set the size of the image
                />
                <p style={{marginLeft:'32px',marginTop:'7px', marginBottom:'-30px'}}>{typingIndicator}</p>
              </div>
            }
          <div
            className="h-[162px] bg-light-green dark:bg-light-green"
            ref={messagesEndRef}
          />
        </div>

        <ChatInput
          stopConversationRef={stopConversationRef}
          textareaRef={textareaRef}
          onSend={(message) => {
            setCurrentMessage(message);
            handleSend(message, 0);
          }}
          onScrollDownClick={handleScrollDown}
          onRegenerate={() => {
            if (currentMessage) {
              handleSend(currentMessage, 2);
            }
          }}
          showScrollDownButton={showScrollDownButton}
        />
      </>
    </div>
  );
});
Chat.displayName = 'Chat';
