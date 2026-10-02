import React, { useState, useEffect } from 'react';
import {
  X,
  Copy,
  Check,
  Mail,
  QrCode,
  Link as LinkIcon,
  ExternalLink,
  Share2,
  Smartphone,
  ShieldCheck,
  Send,
} from 'lucide-react';
import QRCode from 'qrcode';

interface AddPeopleModalProps {
  roomId: string;
  onClose: () => void;
}

export const AddPeopleModal: React.FC<AddPeopleModalProps> = ({ roomId, onClose }) => {
  const [activeTab, setActiveTab] = useState<'link' | 'qr' | 'email'>('link');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedInvite, setCopiedInvite] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [emailInput, setEmailInput] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const meetingUrl = `${window.location.origin}?room=${roomId}`;

  // Generate QR Code on mount
  useEffect(() => {
    QRCode.toDataURL(meetingUrl, {
      width: 260,
      margin: 2,
      color: {
        dark: '#1e1e1e',
        light: '#ffffff',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('Failed to generate QR code:', err));
  }, [meetingUrl]);

  const copyUrl = () => {
    navigator.clipboard.writeText(meetingUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const copyFullInvite = () => {
    const inviteText = `You're invited to join an Omni Meet video call.\n\nMeeting link: ${meetingUrl}\nMeeting code: ${roomId}\n\nJoin directly from your web browser or mobile phone. No download required.`;
    navigator.clipboard.writeText(inviteText);
    setCopiedInvite(true);
    setTimeout(() => setCopiedInvite(false), 2500);
  };

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;

    const subject = encodeURIComponent(`Omni Meet video call invitation: ${roomId}`);
    const body = encodeURIComponent(
      `Hi,\n\nPlease join our video meeting via this link:\n${meetingUrl}\n\nMeeting code: ${roomId}\n\nWorks on desktop and mobile browsers.`
    );
    window.open(`mailto:${emailInput.trim()}?subject=${subject}&body=${body}`, '_blank');
    setEmailSent(true);
    setTimeout(() => setEmailSent(false), 3000);
  };

  const openInNewTab = () => {
    window.open(meetingUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#202124] border border-white/10 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150 flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#1a73e8] text-white flex items-center justify-center shadow-md">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-medium text-white font-['Google_Sans',sans-serif]">
                Add real people
              </h2>
              <p className="text-xs text-slate-400">Share this meeting with friends or colleagues</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-white/5 px-6 bg-[#1a1a1c]">
          <button
            onClick={() => setActiveTab('link')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'link'
                ? 'border-[#8ab4f8] text-[#8ab4f8]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <LinkIcon className="w-4 h-4" />
            <span>Share Link</span>
          </button>

          <button
            onClick={() => setActiveTab('qr')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'qr'
                ? 'border-[#8ab4f8] text-[#8ab4f8]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>Scan Phone QR</span>
          </button>

          <button
            onClick={() => setActiveTab('email')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'email'
                ? 'border-[#8ab4f8] text-[#8ab4f8]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Email Invite</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 space-y-5">
          {/* TAB 1: Link & Code */}
          {activeTab === 'link' && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-medium">Meeting link</label>
                <div className="flex items-center gap-2 p-2.5 bg-[#282a2d] border border-white/10 rounded-2xl">
                  <span className="text-xs text-white truncate flex-1 font-mono pl-2">
                    {meetingUrl}
                  </span>
                  <button
                    onClick={copyUrl}
                    className="flex items-center gap-1.5 px-3 py-2 bg-[#1a73e8] hover:bg-[#1557b0] text-white text-xs font-medium rounded-xl transition-all active:scale-95 shrink-0"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-green-300" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Room Code Display */}
              <div className="p-4 bg-[#282a2d] rounded-2xl border border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 block font-medium">Or join with code:</span>
                  <span className="text-base font-mono text-white font-semibold">{roomId}</span>
                </div>
                <button
                  onClick={copyFullInvite}
                  className="px-3 py-2 bg-white/5 hover:bg-white/10 text-slate-200 rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5"
                >
                  {copiedInvite ? <Check className="w-3.5 h-3.5 text-green-300" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedInvite ? 'Invite Copied' : 'Copy Full Invite'}</span>
                </button>
              </div>

              {/* Test with second tab */}
              <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#8ab4f8]">
                    <ExternalLink className="w-4 h-4" />
                    <span>Test on this computer</span>
                  </div>
                  <button
                    onClick={openInNewTab}
                    className="px-3 py-1.5 bg-[#1a73e8] hover:bg-[#1557b0] text-white rounded-xl text-xs font-medium transition-all flex items-center gap-1 shadow-sm"
                  >
                    <span>Open in new tab</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Open another tab or incognito window to experience real WebRTC peer-to-peer audio, video, and encrypted chat between two people immediately!
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: Scan QR Code with Phone */}
          {activeTab === 'qr' && (
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-3 bg-white rounded-2xl shadow-xl border border-white/20">
                {qrDataUrl ? (
                  <img src={qrDataUrl} alt="Join Meeting QR Code" className="w-52 h-52 rounded-lg" />
                ) : (
                  <div className="w-52 h-52 flex items-center justify-center text-black">
                    Generating QR code...
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-center gap-1.5 text-sm font-semibold text-white">
                  <Smartphone className="w-4 h-4 text-[#8ab4f8]" />
                  <span>Scan with your mobile camera</span>
                </div>
                <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                  Point your iPhone or Android phone camera at the QR code to join this video call directly from your phone.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: Email Invite */}
          {activeTab === 'email' && (
            <form onSubmit={handleSendEmail} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-medium">Participant email address</label>
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="colleague@example.com"
                  className="w-full px-4 py-3 bg-[#282a2d] border border-white/10 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#8ab4f8]"
                />
              </div>

              <button
                type="submit"
                disabled={!emailInput.trim()}
                className="w-full py-3 bg-[#1a73e8] hover:bg-[#1557b0] disabled:opacity-40 text-white rounded-2xl text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-md"
              >
                {emailSent ? <Check className="w-4 h-4 text-green-300" /> : <Send className="w-4 h-4" />}
                <span>{emailSent ? 'Opening mail app...' : 'Send email invitation'}</span>
              </button>

              <div className="p-3 bg-[#282a2d] rounded-2xl border border-white/5 space-y-1 text-xs">
                <span className="text-[11px] text-slate-400 block font-medium">Email invitation preview:</span>
                <p className="text-[11px] text-slate-300 italic">
                  &ldquo;Please join our Omni Meet call: {meetingUrl}&rdquo;
                </p>
              </div>
            </form>
          )}

          {/* Security footnote */}
          <div className="pt-2 border-t border-white/5 flex items-center gap-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-4 h-4 text-green-400 shrink-0" />
            <span>Cross-browser WebRTC connection with DTLS/SRTP encryption</span>
          </div>
        </div>
      </div>
    </div>
  );
};
