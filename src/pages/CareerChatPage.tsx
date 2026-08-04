import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, Sparkles, RefreshCw, Trash2, Loader2, MessageSquare, Copy, Check } from 'lucide-react';
import { streamCareerChat } from '../services/api';
import { ChatMessage } from '../types';
import { MarkdownRenderer } from '../components/MarkdownRenderer';

interface Props {
  resumeText: string;
  targetRole: string;
}

export const CareerChatPage: React.FC<Props> = ({ resumeText, targetRole }) => {
  const getDefaultWelcomeMessage = (): ChatMessage => ({
    id: 'welcome-msg',
    sender: 'assistant',
    text: `Hello! I am your **CareerPilot AI Coach**. How can I help you today?\n\nYou can ask me to:\n- Critique specific sections of your resume\n- Provide salary negotiation tactics for **${targetRole || 'your target role'}**\n- Explain complex technical concepts or interview questions\n- Give tailored advice on networking or job search strategy`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  });

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('careerpilot_chat_messages');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        // ignore error
      }
    }
    return [getDefaultWelcomeMessage()];
  });

  const [inputPrompt, setInputPrompt] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('careerpilot_chat_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    const handleReset = () => {
      setMessages([getDefaultWelcomeMessage()]);
      setInputPrompt('');
    };
    window.addEventListener('careerpilot_reset_session', handleReset);
    return () => window.removeEventListener('careerpilot_reset_session', handleReset);
  }, [targetRole]);

  const copyMessage = (msgId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(msgId);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  const samplePrompts = [
    'How do I explain an employment gap on my resume?',
    `What are top interview questions for a ${targetRole || 'Frontend Dev'} role?`,
    'How do I negotiate salary for my first tech job offer?',
    'How do I tailor my resume bullet points for ATS compliance?',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming]);

  const handleSendMessage = (textToSend?: string) => {
    const promptText = textToSend || inputPrompt;
    if (!promptText.trim() || isStreaming) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: promptText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const assistantMsgId = `assistant-${Date.now()}`;
    const initialAssistantMsg: ChatMessage = {
      id: assistantMsgId,
      sender: 'assistant',
      text: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages([...updatedMessages, initialAssistantMsg]);
    setInputPrompt('');
    setIsStreaming(true);

    streamCareerChat(
      updatedMessages,
      { role: targetRole, resumeText },
      (chunk) => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMsgId ? { ...msg, text: msg.text + chunk } : msg
          )
        );
      },
      () => {
        setIsStreaming(false);
      },
      (err) => {
        console.error('Chat error:', err);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMsgId
              ? { ...msg, text: msg.text + `\n\n*(Error streaming response: ${err.message || 'Network issue'})*` }
              : msg
          )
        );
        setIsStreaming(false);
      }
    );
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'assistant',
        text: 'Chat history cleared. How else can I assist your career journey?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div id="career-chat-page" className="space-y-6 py-4 flex flex-col h-[calc(100vh-140px)] min-h-[550px]">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 flex-shrink-0">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Bot className="w-5 h-5 text-cyan-500" />
            Streaming AI Career Coach Chat
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Real-time interactive career guidance, interview prep, and salary negotiation support.
          </p>
        </div>

        <button
          id="clear-chat-btn"
          onClick={handleClearChat}
          className="px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-600 text-xs font-semibold flex items-center gap-1.5"
        >
          <Trash2 className="w-3.5 h-3.5" /> Clear History
        </button>
      </div>

      {/* Chat Messages Container */}
      <div className="flex-1 bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm overflow-y-auto space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${
              msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            {/* Avatar */}
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold shadow-sm flex-shrink-0 ${
              msg.sender === 'user'
                ? 'bg-blue-600'
                : 'bg-gradient-to-tr from-slate-900 via-indigo-900 to-cyan-500'
            }`}>
              {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-cyan-300" />}
            </div>

            {/* Message Bubble */}
            <div className={`max-w-[85%] sm:max-w-[78%] rounded-2xl p-4 text-xs ${
              msg.sender === 'user'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-900 shadow-sm'
            }`}>
              <div className="flex items-center justify-between mb-2 gap-4 text-[10px] border-b pb-1 border-slate-100">
                <span className={`font-bold uppercase tracking-wider ${
                  msg.sender === 'user' ? 'text-blue-100' : 'text-cyan-800'
                }`}>
                  {msg.sender === 'user' ? 'You' : 'CareerPilot AI'}
                </span>
                <div className="flex items-center gap-2">
                  <span className="opacity-60">{msg.timestamp}</span>
                  {msg.sender === 'assistant' && msg.text && (
                    <button
                      id={`copy-chat-msg-btn-${msg.id}`}
                      onClick={() => copyMessage(msg.id, msg.text)}
                      title="Copy response"
                      className="p-1 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-1"
                    >
                      {copiedMsgId === msg.id ? (
                        <Check className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      <span className="text-[10px] font-semibold">{copiedMsgId === msg.id ? 'Copied' : 'Copy'}</span>
                    </button>
                  )}
                </div>
              </div>

              {msg.sender === 'user' ? (
                <p className="whitespace-pre-wrap font-medium leading-relaxed">{msg.text}</p>
              ) : (
                msg.text ? (
                  <MarkdownRenderer content={msg.text} />
                ) : (
                  <div className="flex items-center gap-2 text-slate-500 py-2">
                    <Loader2 className="w-4 h-4 animate-spin text-cyan-600" />
                    <span>Analyzing your context and generating advice...</span>
                  </div>
                )
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs flex-shrink-0 scrollbar-none">
        <span className="text-slate-400 font-medium text-[11px] whitespace-nowrap">Suggested:</span>
        {samplePrompts.map((p, idx) => (
          <button
            key={idx}
            id={`suggested-prompt-btn-${idx}`}
            onClick={() => handleSendMessage(p)}
            disabled={isStreaming}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-cyan-50 hover:border-cyan-300 border border-slate-200 text-slate-700 text-[11px] font-medium whitespace-nowrap transition-colors"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="flex items-center gap-2 bg-white rounded-2xl border border-slate-300 p-2 shadow-sm flex-shrink-0">
        <input
          id="chat-input-field"
          type="text"
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Ask CareerPilot AI anything about your resume, interview, or salary..."
          className="flex-1 px-3 py-2 text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none"
        />

        <button
          id="send-chat-message-btn"
          onClick={() => handleSendMessage()}
          disabled={isStreaming || !inputPrompt.trim()}
          className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
        >
          {isStreaming ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>

    </div>
  );
};
