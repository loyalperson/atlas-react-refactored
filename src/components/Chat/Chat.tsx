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

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };
  

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = useCallback(
    async (message: Message, deleteCount = 0) => {
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
        // const chatBody: ChatBody = {
        //   model: updatedConversation.model,
        //   messages: updatedConversation.messages,
        //   key: apiKey,
        //   prompt: updatedConversation.prompt,
        //   temperature: updatedConversation.temperature,
        // };
        // const endpoint = getEndpoint();
        // let body;
        // const elevation = localStorage.getItem('Elevation') || '';
        // const parcelData = localStorage.getItem('parcelData') || '';
        // const incomeData = localStorage.getItem('incomeData') || '';
        // const address = localStorage.getItem('Address') || '';

        // body = JSON.stringify({chatBody, elevation, parcelData, incomeData, address});

        // const controller = new AbortController();
        // const response = await fetch(endpoint, {
        //   method: 'POST',
        //   headers: {
        //     'Content-Type': 'application/json',
        //   },
        //   signal: controller.signal,
        //   body,
        // });
        // if (!response.ok) {
        //   homeDispatch({ field: 'loading', value: false });
        //   homeDispatch({ field: 'messageIsStreaming', value: false });
        //   toast.error(response.statusText);
        //   return;
        // }
        // const data = response.body;
        // if (!data) {
        homeDispatch({ field: 'loading', value: false });
        homeDispatch({ field: 'messageIsStreaming', value: false });
        //   return;
        // }
        // if (updatedConversation.messages.length === 1) {
        //   const { content } = message;
        //   const customName =
        //     content.length > 30 ? content.substring(0, 30) + '...' : content;
        //   updatedConversation = {
        //     ...updatedConversation,
        //     name: customName,
        //   };
        // }
        // homeDispatch({ field: 'loading', value: false });
        // const reader = data.getReader();
        // const decoder = new TextDecoder();
        // let done = false;
        // let isFirst = true;
        // let text = '';
        // while (!done) {
        //   if (stopConversationRef.current === true) {
        //     controller.abort();
        //     done = true;
        //     break;
        //   }
        //   const { value, done: doneReading } = await reader.read();
        //   done = doneReading;
        //   const chunkValue = decoder.decode(value);
        //   text += chunkValue;
        //   if (isFirst) {
        //     isFirst = false;
        //     const updatedMessages: Message[] = [
        //       ...updatedConversation.messages,
        //       { role: 'assistant', content: chunkValue },
        //     ];
        //     updatedConversation = {
        //       ...updatedConversation,
        //       messages: updatedMessages,
        //     };
        //     homeDispatch({
        //       field: 'selectedConversation',
        //       value: updatedConversation,
        //     });
        //   } else {
        //     const updatedMessages: Message[] =
        //       updatedConversation.messages.map((message, index) => {
        //         if (index === updatedConversation.messages.length - 1) {
        //           return {
        //             ...message,
        //             content: text,
        //           };
        //         }
        //         return message;
        //       });
        //     updatedConversation = {
        //       ...updatedConversation,
        //       messages: updatedMessages,
        //     };
        //     homeDispatch({
        //       field: 'selectedConversation',
        //       value: updatedConversation,
        //     });
        //   }
        // }
        updatedConversation['messages'] = updatedConversation['messages'].concat([{role: 'assistant', content: 'hi'}]);

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
