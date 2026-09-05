import React, { useState, useEffect, useMemo, createContext, useContext } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { getDatabase, ref, push, update, remove, onValue } from 'firebase/database';
import { 
  Glasses, Home, ShoppingCart, TrendingUp, FileText, ArrowRightLeft, 
  Wallet, Archive, Unlock, PackageOpen, Boxes, Users, Truck, Tags, 
  UserPlus, Settings, LifeBuoy, Moon, Sun, Trash2, X, Plus, Search, 
  ChevronRight, Check, MessageCircle, Bell, AlertTriangle, Edit2, LogOut, Lock, Mail, LineChart, ShieldCheck, Menu
} from 'lucide-react';

// --- CONFIGURAÇÃO FIREBASE SEGURA ---
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);
const appId = 'otica-visao-erp';

// --- CONTEXT API ---
const AppContext = createContext<any>(null);
export const useAppContext = () => useContext(AppContext);

// Helper de formatação
const formatMoney = (v: number | string) => Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

function SidebarItem({ icon: Icon, label, active, onClick, badge, badgeColor }: any) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all ${
        active 
          ? 'bg-indigo-50 dark:bg-indigo-900/30 text-[#4A3AFF] dark:text-indigo-400 font-bold' 
          : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-700 dark:hover:text-slate-300 font-medium'
      }`}
    >
      <div className="flex items-center">
        <Icon size={20} className={`mr-3 ${active ? 'text-[#4A3AFF] dark:text-indigo-400' : 'text-slate-400'}`} />
        <span className="text-[14px]">{label}</span>
      </div>
      {badge && (
        <span className={`px-2 py-0.5 rounded-lg text-[11px] font-bold ${badgeColor}`}>
          {badge}
        </span>
      )}
    </button>
  );
}

function BottomNavItem({ icon: Icon, label, active, onClick, badge }: any) {
  return (
    <button onClick={onClick} className={`flex flex-col items-center justify-center flex-1 h-full space-y-1 relative transition-colors ${active ? 'text-[#4A3AFF] dark:text-indigo-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}>
      <div className="relative">
         <Icon size={22} className={active ? 'drop-shadow-sm' : ''} />
         {badge > 0 && <span className="absolute -top-1.5 -right-2 bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-white dark:border-slate-800">{badge}</span>}
      </div>
      <span className={`text-[10px] font-medium ${active ? 'font-bold' : ''}`}>{label}</span>
    </button>
  );
}

function SidebarCategory({ label }: any) {
  return (
    <div className="px-4 pt-4 pb-2">
      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
    </div>
  );
}

function DashCard({ title, value, subtitle, icon: Icon, bg = "bg-white dark:bg-slate-800", color = "text-slate-900 dark:text-white", border = "border-slate-100 dark:border-slate-700" }: any) {
  return (
    <div className={`${bg} rounded-3xl border ${border} p-6 shadow-sm flex flex-col justify-between h-[160px] relative overflow-hidden group`}>
      <div className="flex justify-between items-start relative z-10">
        <p className="text-[14px] font-bold text-slate-500">{title}</p>
        <Icon size={20} className="text-slate-400 group-hover:scale-110 transition-transform" />
      </div>
      <div className="relative z-10">
        <h3 className={`text-3xl sm:text-4xl font-black tracking-tight mb-1 ${color}`}>{value}</h3>
        {subtitle && <p className="text-[13px] font-medium text-slate-500">{subtitle}</p>}
      </div>
    </div>
  );
}

function ActionCard({ icon: Icon, title, desc, onClick, color, bg }: any) {
  return (
    <div onClick={onClick} className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 p-6 sm:p-8 shadow-sm hover:border-[#4A3AFF]/50 hover:shadow-md cursor-pointer transition-all group flex flex-col justify-between h-[150px] sm:h-[160px]">
       <div className={`w-12 h-12 rounded-2xl ${bg} ${color} flex items-center justify-center mb-3 group-hover:scale-105 transition-transform`}>
         <Icon size={24} />
       </div>
       <div className="flex items-end justify-between mt-auto">
         <div>
           <h4 className="font-bold text-[16px] sm:text-[18px] text-slate-900 dark:text-white mb-1">{title}</h4>
           <p className="text-[13px] sm:text-[14px] text-slate-500 line-clamp-1">{desc}</p>
         </div>
         <ChevronRight size={20} className="text-slate-300 group-hover:text-[#4A3AFF] transition-colors mb-1" />
       </div>
    </div>
  );
}

function ModalBase({ open, onClose, title, width, children }: any) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70] bg-slate-900/60 backdrop-blur-sm sm:p-4 flex items-end sm:items-center justify-center overflow-y-auto pt-10 sm:pt-20 sm:pb-20">
      <div className={`bg-white dark:bg-slate-800 w-full sm:rounded-[32px] rounded-t-[32px] border border-slate-100 dark:border-slate-700 shadow-2xl ${width} my-auto animate-fade-in overflow-hidden max-h-[90vh] flex flex-col`}>
        <div className="px-5 sm:px-8 py-5 sm:py-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-white dark:bg-slate-800 relative z-10 shrink-0">
          <h2 className="font-bold text-lg sm:text-xl text-slate-900 dark:text-white">{title}</h2>
          <button onClick={onClose} className="p-2 sm:p-2.5 bg-slate-50 hover:bg-rose-50 dark:bg-slate-700 dark:hover:bg-rose-900/30 rounded-full text-slate-400 hover:text-rose-500 transition-colors"><X size={18}/></button>
        </div>
        <div className="overflow-y-auto custom-scrollbar flex-1">
            {children}
        </div>
      </div>
    </div>
  );
}

function GenericForm({ config, initialData, onSave, onClose }: any) {
  const [form, setForm] = useState(initialData || config.defaultData);
  const handleChange = (field: string, value: any) => setForm((prev: any) => ({ ...prev, [field]: value }));
  const inputClass = "w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3.5 text-[15px] outline-none focus:border-[#4A3AFF] focus:ring-1 focus:ring-[#4A3AFF] transition-all text-slate-900 dark:text-white";
  const labelClass = "text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-2 block";

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(form); }} className="flex flex-col h-full">
      <div className="p-5 sm:p-8 space-y-5 flex-1">
        {config.fields.map((f: any) => (
          <div key={f.name}>
            <label className={labelClass}>{f.label} {f.required && '*'}</label>
            {f.type === 'select' ? (
              <select required={f.required} value={form[f.name] || ''} onChange={e=>handleChange(f.name, e.target.value)} className={inputClass}>
                {f.options.map((o: any) => <option key={o.val} value={o.val}>{o.label}</option>)}
              </select>
            ) : (
              <input type={f.type} step={f.step} required={f.required} value={form[f.name] || ''} onChange={e=>handleChange(f.name, e.target.value)} className={inputClass} />
            )}
          </div>
        ))}
      </div>
      <div className="px-5 sm:px-8 py-5 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3 sm:gap-4 bg-slate-50 dark:bg-slate-800/50">
        <button type="button" onClick={onClose} className="flex-1 sm:flex-none px-6 py-3.5 rounded-xl text-[15px] font-bold hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors">Cancelar</button>
        <button type="submit" className="flex-1 sm:flex-none px-8 py-3.5 rounded-xl text-[15px] font-bold bg-[#4A3AFF] text-white shadow-md shadow-indigo-500/20 hover:bg-[#3d2ee6] transition-all">Salvar</button>
      </div>
    </form>
  );
}

function FormCliente({ data, onSave, onClose }: any) {
  const [form, setForm] = useState({
    nome: '', cpf: '', tel: '', nasc: '', 
    prescricao: {
      medico: '', obs: '',
      od: { esf: '', cil: '', eixo: '', dnp: '', add: '' },
      oe: { esf: '', cil: '', eixo: '', dnp: '', add: '' }
    }
  });

  useEffect(() => {
    if (data) {
       setForm({
         ...data,
         prescricao: {
           medico: data.prescricao?.medico || '', obs: data.prescricao?.obs || '',
           od: { esf: '', cil: '', eixo: '', dnp: '', add: '', ...(data.prescricao?.od || {}) },
           oe: { esf: '', cil: '', eixo: '', dnp: '', add: '', ...(data.prescricao?.oe || {}) }
         }
       });
    }
  }, [data]);

  const handleChange = (field: string, value: any) => setForm(prev => ({ ...prev, [field]: value }));
  const handlePresc = (eye: 'od'|'oe', field: string, value: any) => setForm(prev => ({ ...prev, prescricao: { ...prev.prescricao, [eye]: { ...prev.prescricao[eye], [field]: value } } }));
  const submit = (e: React.FormEvent) => { e.preventDefault(); onSave(form); };

  const inputClass = "w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3.5 text-[15px] outline-none focus:border-[#4A3AFF] focus:ring-1 focus:ring-[#4A3AFF] transition-all text-slate-900 dark:text-white";
  const labelClass = "text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-2 block";

  return (
    <form onSubmit={submit} className="flex flex-col h-full">
      <div className="p-5 sm:p-8 space-y-8 flex-1">
        <div>
          <h3 className="text-[13px] font-bold text-[#4A3AFF] uppercase tracking-widest mb-4 flex items-center gap-2"><UserPlus size={16}/> Dados Pessoais</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="sm:col-span-2"><label className={labelClass}>Nome Completo</label><input required value={form.nome} onChange={e=>handleChange('nome', e.target.value)} className={inputClass} /></div>
            <div><label className={labelClass}>WhatsApp</label><input required value={form.tel} onChange={e=>handleChange('tel', e.target.value)} className={inputClass} placeholder="(00) 00000-0000" /></div>
            <div><label className={labelClass}>CPF</label><input value={form.cpf} onChange={e=>handleChange('cpf', e.target.value)} className={inputClass} /></div>
            <div><label className={labelClass}>Nascimento</label><input type="date" value={form.nasc} onChange={e=>handleChange('nasc', e.target.value)} className={inputClass} /></div>
          </div>
        </div>

        <div className="border-t border-slate-100 dark:border-slate-700 pt-6">
          <h3 className="text-[13px] font-bold text-emerald-500 uppercase tracking-widest mb-4 flex items-center gap-2"><Glasses size={16}/> Receituário Ótico (Refração)</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
             <div><label className={labelClass}>Médico Oftalmologista</label><input value={form.prescricao.medico} onChange={e=>setForm(prev=>({...prev, prescricao:{...prev.prescricao, medico: e.target.value}}))} className={inputClass} placeholder="Dr. Nome do Médico" /></div>
             <div><label className={labelClass}>Observações (Ex: Antirreflexo)</label><input value={form.prescricao.obs} onChange={e=>setForm(prev=>({...prev, prescricao:{...prev.prescricao, obs: e.target.value}}))} className={inputClass} /></div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden overflow-x-auto">
             <div className="min-w-[500px]">
               <div className="grid grid-cols-6 gap-3 p-4 bg-white dark:bg-slate-800 font-bold text-[11px] sm:text-[12px] text-slate-500 uppercase tracking-wider text-center border-b border-slate-200 dark:border-slate-700">
                  <div className="text-left flex items-center pl-2">Olho</div><div>Esférico</div><div>Cilíndrico</div><div>Eixo</div><div>DNP/DP</div><div>Adição</div>
               </div>
               <div className="grid grid-cols-6 gap-3 p-4 items-center border-b border-slate-200 dark:border-slate-700">
                  <div className="font-bold text-[#4A3AFF] dark:text-indigo-400 text-[14px] sm:text-[16px] pl-2">OD <span className="text-[10px] sm:text-[11px] text-slate-400 block font-medium uppercase mt-0.5">Direito</span></div>
                  {['esf', 'cil', 'eixo', 'dnp', 'add'].map(f => (
                     <input key={`od-${f}`} value={(form.prescricao.od as any)[f]} onChange={e=>handlePresc('od', f, e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl px-1 sm:px-2 py-3 text-center text-[14px] sm:text-[15px] font-bold outline-none focus:border-[#4A3AFF] focus:ring-1 focus:ring-[#4A3AFF] transition-all" placeholder={f==='eixo'||f==='dnp'?'0':'0.00'} />
                  ))}
               </div>
               <div className="grid grid-cols-6 gap-3 p-4 items-center">
                  <div className="font-bold text-emerald-500 text-[14px] sm:text-[16px] pl-2">OE <span className="text-[10px] sm:text-[11px] text-slate-400 block font-medium uppercase mt-0.5">Esquerdo</span></div>
                  {['esf', 'cil', 'eixo', 'dnp', 'add'].map(f => (
                     <input key={`oe-${f}`} value={(form.prescricao.oe as any)[f]} onChange={e=>handlePresc('oe', f, e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl px-1 sm:px-2 py-3 text-center text-[14px] sm:text-[15px] font-bold outline-none focus:border-[#4A3AFF] focus:ring-1 focus:ring-[#4A3AFF] transition-all" placeholder={f==='eixo'||f==='dnp'?'0':'0.00'} />
                  ))}
               </div>
             </div>
          </div>
        </div>
      </div>
      <div className="px-5 sm:px-8 py-5 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3 sm:gap-4 bg-white dark:bg-slate-800">
        <button type="button" onClick={onClose} className="flex-1 sm:flex-none px-6 py-3.5 rounded-xl text-[15px] font-bold hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors">Cancelar</button>
        <button type="submit" className="flex-1 sm:flex-none px-8 py-3.5 rounded-xl text-[15px] font-bold bg-[#4A3AFF] hover:bg-[#3d2ee6] text-white shadow-md shadow-indigo-500/20 transition-all">Salvar Ficha</button>
      </div>
    </form>
  );
}

function FormProduto({ data, onSave, onClose }: any) {
  const [form, setForm] = useState(data || {
    codigo: '', categoria: 'Armação', marca: '', modelo: '', cor: '',
    custo: '', venda: '', qtd: '', min: ''
  });
  
  const h = (f: string, v: any) => setForm((p: any) => ({ ...p, [f]: v }));
  const inputClass = "w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3.5 text-[15px] outline-none focus:border-[#4A3AFF] focus:ring-1 focus:ring-[#4A3AFF] transition-all text-slate-900 dark:text-white";
  const labelClass = "text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-2 block";

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave({...form, custo: Number(form.custo), venda: Number(form.venda), qtd: Number(form.qtd), min: Number(form.min)}); }} className="flex flex-col h-full">
      <div className="p-5 sm:p-8 grid grid-cols-1 sm:grid-cols-3 gap-5 flex-1">
        <div><label className={labelClass}>SKU (Cód)</label><input required value={form.codigo} onChange={e=>h('codigo', e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Categoria</label>
           <select value={form.categoria} onChange={e=>h('categoria', e.target.value)} className={inputClass}>
             <option>Armação</option><option>Lente</option><option>Óculos de Sol</option><option>Acessório</option>
           </select>
        </div>
        <div><label className={labelClass}>Marca</label><input required value={form.marca} onChange={e=>h('marca', e.target.value)} className={inputClass} /></div>
        <div className="sm:col-span-2"><label className={labelClass}>Modelo</label><input value={form.modelo} onChange={e=>h('modelo', e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Cor</label><input value={form.cor} onChange={e=>h('cor', e.target.value)} className={inputClass} /></div>
        
        <div className="sm:col-span-3 border-t border-slate-100 dark:border-slate-700 my-1"></div>
        
        <div><label className={labelClass}>Custo (R$)</label><input type="number" step="0.01" required value={form.custo} onChange={e=>h('custo', e.target.value)} className={inputClass} /></div>
        <div><label className="text-[12px] font-bold text-emerald-500 uppercase tracking-wider mb-2 block">Venda (R$)</label><input type="number" step="0.01" required value={form.venda} onChange={e=>h('venda', e.target.value)} className={`${inputClass} border-emerald-200 dark:border-emerald-800 focus:border-emerald-500 focus:ring-emerald-500 font-extrabold`} /></div>
        <div><label className={labelClass}>Estoque Atual</label><input type="number" required value={form.qtd} onChange={e=>h('qtd', e.target.value)} className={inputClass} /></div>
        <div><label className="text-[12px] font-bold text-rose-500 uppercase tracking-wider mb-2 block">Estoque Mín.</label><input type="number" required value={form.min} onChange={e=>h('min', e.target.value)} className={`${inputClass} border-rose-200 dark:border-rose-800 focus:border-rose-500 focus:ring-rose-500`} /></div>
      </div>
      <div className="px-5 sm:px-8 py-5 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3 sm:gap-4 bg-slate-50 dark:bg-slate-800/50">
        <button type="button" onClick={onClose} className="flex-1 sm:flex-none px-6 py-3.5 rounded-xl text-[15px] font-bold hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors">Cancelar</button>
        <button type="submit" className="flex-1 sm:flex-none px-8 py-3.5 rounded-xl text-[15px] font-bold bg-[#4A3AFF] hover:bg-[#3d2ee6] text-white shadow-md shadow-indigo-500/20 transition-all">Salvar Produto</button>
      </div>
    </form>
  );
}

function DashboardScreen() {
  const { produtos, vendas, clientes, setActiveTab } = useAppContext();
  
  return (
    <div className="animate-fade-in max-w-[1100px] mx-auto">
      <div className="mb-8 sm:mb-10">
        <p className="text-[11px] font-bold text-[#4A3AFF] dark:text-indigo-400 uppercase tracking-widest mb-1 sm:mb-2">Resumo Diário</p>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">Bom dia, Gestor!</h1>
        <p className="text-slate-500 dark:text-slate-400 text-[14px] sm:text-[15px]">Aqui está o panorama da sua ótica.</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
        <DashCard title="Estoque Total" value={produtos.reduce((acc:any, p:any) => acc + Number(p.qtd), 0)} subtitle="unidades ativas" icon={Boxes} />
        <DashCard title="Vendas do Mês" value={formatMoney(vendas.reduce((acc:any, v:any) => acc + (v.total || 0), 0))} subtitle={`${vendas.length} registros`} icon={TrendingUp} color="text-emerald-500" />
        <DashCard title="Clientes Base" value={clientes.length} subtitle="cadastros ativos" icon={Users} />
        <DashCard title="Estoque Crítico" value={produtos.filter((p:any)=>Number(p.qtd)<Number(p.min)).length} subtitle="produtos acabando" icon={AlertTriangle} bg="bg-rose-50 dark:bg-rose-900/10" color="text-rose-500" border="border-rose-100 dark:border-rose-900/30" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <ActionCard icon={Wallet} title="Gerenciar Caixa" desc="Abrir, fechar ou conferir caixa do dia" onClick={() => setActiveTab('caixa')} color="text-[#4A3AFF]" bg="bg-indigo-50 dark:bg-indigo-900/40" />
        <ActionCard icon={ShoppingCart} title="Ir para o PDV" desc="Iniciar uma nova venda" onClick={() => setActiveTab('vendas')} color="text-emerald-600" bg="bg-emerald-50 dark:bg-emerald-900/40" />
      </div>
    </div>
  );
}

function PdvScreen() {
  const { 
    caixaAberto, pdvSearch, setPdvSearch, pdvFiltered, addToCart, carrinho, removeFromCart,
    pdvCliente, setPdvCliente, clientes, pdvDesconto, setPdvDesconto, pdvPagamento, setPdvPagamento, 
    finalizarVenda, setActiveTab
  } = useAppContext();

  const [mobileTab, setMobileTab] = useState('produtos');

  return (
    <div className="animate-fade-in max-w-[1200px] mx-auto h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8 gap-4">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">Ponto de Venda</h2>
        {caixaAberto ? (
           <span className="bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 px-4 py-2 rounded-xl text-[14px] font-bold flex items-center justify-center border border-emerald-100 dark:border-emerald-800/50"><Wallet size={18} className="mr-2"/> Caixa Aberto</span>
        ) : (
           <span className="bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400 px-4 py-2 rounded-xl text-[14px] font-bold flex items-center justify-center border border-rose-100 dark:border-rose-800/50"><Lock size={18} className="mr-2"/> Caixa Fechado</span>
        )}
      </div>
      
      {caixaAberto && (
        <div className="lg:hidden flex mb-4 bg-slate-200 dark:bg-slate-700/50 rounded-xl p-1 shrink-0">
           <button onClick={() => setMobileTab('produtos')} className={`flex-1 py-2.5 rounded-lg font-bold text-sm transition-all ${mobileTab === 'produtos' ? 'bg-white dark:bg-slate-800 text-[#4A3AFF] shadow-sm' : 'text-slate-500'}`}>Produtos</button>
           <button onClick={() => setMobileTab('carrinho')} className={`flex-1 py-2.5 rounded-lg font-bold text-sm transition-all ${mobileTab === 'carrinho' ? 'bg-white dark:bg-slate-800 text-[#4A3AFF] shadow-sm' : 'text-slate-500'}`}>Carrinho ({carrinho.length})</button>
        </div>
      )}

      {!caixaAberto ? (
         <div className="flex-1 flex flex-col items-center justify-center bg-transparent border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl p-8 sm:p-16 text-center">
           <div className="w-16 h-16 sm:w-20 sm:h-20 bg-rose-50 dark:bg-rose-900/20 rounded-full flex items-center justify-center text-rose-500 mb-6 shadow-sm border border-rose-100 dark:border-rose-800"><Lock className="w-8 h-8 sm:w-10 sm:h-10"/></div>
           <h2 className="text-xl sm:text-2xl font-bold mb-3 text-slate-800 dark:text-slate-200">O Caixa está Fechado</h2>
           <p className="text-slate-500 mb-8 max-w-md text-[14px] sm:text-[15px] leading-relaxed">Para garantir a segurança financeira do PDV, é obrigatório abrir o caixa do dia antes de registrar qualquer venda.</p>
           <button onClick={() => setActiveTab('caixa')} className="bg-[#4A3AFF] hover:bg-[#3d2ee6] text-white px-8 py-3.5 rounded-xl font-bold shadow-md shadow-indigo-500/20 transition-all text-[15px]">Ir para o Controle de Caixa</button>
         </div>
      ) : (
         <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-6">
           <div className={`lg:w-[60%] xl:w-[65%] bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm flex-col p-4 sm:p-6 min-h-0 ${mobileTab === 'produtos' ? 'flex' : 'hidden lg:flex'}`}>
             <div className="relative mb-6 flex-shrink-0">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
               <input 
                 type="text" 
                 placeholder="Buscar por marca, modelo ou código..."
                 value={pdvSearch}
                 onChange={(e) => setPdvSearch(e.target.value)}
                 className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl pl-12 pr-4 py-3.5 text-[15px] outline-none focus:border-[#4A3AFF] focus:ring-1 focus:ring-[#4A3AFF] transition-all"
               />
             </div>
             <div className="flex-1 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 content-start custom-scrollbar pr-2 pb-4">
               {pdvFiltered.map((p:any) => (
                 <div key={p.id} onClick={() => { addToCart(p); setMobileTab('carrinho'); }} className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl p-4 sm:p-5 cursor-pointer hover:border-[#4A3AFF] dark:hover:border-indigo-400 hover:shadow-md transition-all flex flex-col h-full group">
                   <div className="text-[11px] text-slate-400 font-mono mb-2">{p.codigo}</div>
                   <div className="font-bold text-[15px] text-slate-800 dark:text-slate-200 leading-tight mb-1 truncate group-hover:text-[#4A3AFF] transition-colors">{p.marca} {p.modelo}</div>
                   <div className="text-[12px] text-slate-500 mb-4 truncate">{p.categoria}</div>
                   <div className="mt-auto flex justify-between items-end border-t border-slate-200 dark:border-slate-800 pt-3">
                     <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-lg">{formatMoney(p.venda)}</span>
                     <span className="text-[11px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-1 rounded-lg font-bold text-slate-500">Est: {p.qtd}</span>
                   </div>
                 </div>
               ))}
               {pdvFiltered.length === 0 && <div className="col-span-full py-10 text-center text-slate-400">Nenhum produto encontrado.</div>}
             </div>
           </div>

           <div className={`lg:w-[40%] xl:w-[35%] bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm flex-col p-4 sm:p-6 min-h-0 ${mobileTab === 'carrinho' ? 'flex' : 'hidden lg:flex'}`}>
             <h3 className="hidden lg:block font-bold text-xl mb-5 text-slate-900 dark:text-white flex-shrink-0">Carrinho</h3>
             <div className="mb-5 flex-shrink-0">
               <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-2">Cliente Vinculado</label>
               <select value={pdvCliente} onChange={(e)=>setPdvCliente(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-[14px] outline-none focus:border-[#4A3AFF] focus:ring-1 focus:ring-[#4A3AFF] transition-all text-slate-900 dark:text-white">
                 <option value="">Consumidor Final (Balcão)</option>
                 {clientes.map((c:any) => <option key={c.id} value={c.id}>{c.nome}</option>)}
               </select>
             </div>

             <div className="flex-1 overflow-y-auto space-y-3 mb-6 bg-slate-50 dark:bg-slate-900/50 p-2 sm:p-3 rounded-2xl border border-slate-100 dark:border-slate-700 custom-scrollbar">
               {carrinho.length === 0 && <p className="text-center text-slate-400 py-12 text-[14px]">O carrinho está vazio.</p>}
               {carrinho.map((c:any) => (
                 <div key={c.id} className="flex justify-between items-center p-3 sm:p-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl shadow-sm">
                   <div className="flex-1 min-w-0 pr-2 sm:pr-3">
                     <div className="font-bold text-[13px] sm:text-[14px] text-slate-800 dark:text-slate-200 truncate">{c.marca} {c.modelo}</div>
                     <div className="text-[11px] sm:text-[12px] text-slate-500 mt-1 flex items-center"><span className="font-bold bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded mr-1 text-slate-700 dark:text-slate-300">{c.qtd}x</span> {formatMoney(c.venda)}</div>
                   </div>
                   <div className="font-extrabold text-[14px] sm:text-[15px] text-slate-900 dark:text-white mr-2 sm:mr-3">{formatMoney(c.venda * c.qtd)}</div>
                   <button onClick={() => removeFromCart(c.id)} className="text-slate-300 hover:text-rose-500 transition-colors p-1"><X size={18} /></button>
                 </div>
               ))}
             </div>

             <div className="pt-4 sm:pt-5 border-t border-slate-100 dark:border-slate-700 flex-shrink-0">
               <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
                 <div>
                   <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Desc (R$)</label>
                   <input type="number" min="0" value={pdvDesconto} onChange={(e)=>setPdvDesconto(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-[14px] outline-none focus:border-[#4A3AFF] focus:ring-1 focus:ring-[#4A3AFF] transition-all text-slate-900 dark:text-white" />
                 </div>
                 <div>
                   <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Pagamento</label>
                   <select value={pdvPagamento} onChange={(e)=>setPdvPagamento(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-[14px] outline-none focus:border-[#4A3AFF] focus:ring-1 focus:ring-[#4A3AFF] transition-all text-slate-900 dark:text-white">
                     <option>Pix</option><option>Crédito</option><option>Débito</option><option>Dinheiro</option>
                   </select>
                 </div>
               </div>
               
               <div className="flex justify-between items-end mb-4 sm:mb-6">
                 <span className="font-bold text-slate-500 text-[14px] sm:text-[15px]">Total Geral</span>
                 <span className="text-3xl sm:text-4xl font-black text-[#4A3AFF] dark:text-indigo-400 leading-none">
                   {formatMoney(Math.max(0, carrinho.reduce((a:any,b:any)=>a+(b.venda*b.qtd),0) - (Number(pdvDesconto)||0)))}
                 </span>
               </div>

               <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <button onClick={() => finalizarVenda(true)} className="w-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-[#4A3AFF] dark:hover:border-indigo-400 text-slate-700 dark:text-slate-300 py-3 sm:py-3.5 rounded-xl font-bold text-[13px] sm:text-[14px] flex items-center justify-center transition-all">
                    <FileText size={18} className="mr-2 hidden sm:block" /> Orçamento
                  </button>
                  <button onClick={() => finalizarVenda(false)} className="w-full bg-[#4A3AFF] hover:bg-[#3d2ee6] text-white py-3 sm:py-3.5 rounded-xl font-bold text-[13px] sm:text-[14px] flex items-center justify-center transition-all shadow-md shadow-indigo-500/20">
                    <Check size={18} className="mr-2 hidden sm:block" /> Vender
                  </button>
               </div>
             </div>
           </div>
         </div>
      )}
    </div>
  );
}

function CaixaScreen() {
  const { caixaAberto, setModalFecharCaixa, setModalAbrirCaixa, totalVendasCaixa, caixas } = useAppContext();

  return (
    <div className="animate-fade-in max-w-[1100px] mx-auto">
      <div className="mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">Caixa Diário</h2>
          <p className="text-[14px] sm:text-[15px] text-slate-500 mt-1 sm:mt-2">Abertura e fechamento de caixa para o PDV.</p>
        </div>
        {caixaAberto ? (
           <button onClick={() => setModalFecharCaixa(true)} className="w-full sm:w-auto justify-center bg-rose-500 hover:bg-rose-600 text-white px-6 py-3 rounded-xl text-sm font-semibold flex items-center transition-all shadow-md shadow-rose-500/20">
             <Archive size={18} className="mr-2" /> Fechar Caixa
           </button>
        ) : (
           <button onClick={() => setModalAbrirCaixa(true)} className="w-full sm:w-auto justify-center bg-[#4A3AFF] hover:bg-[#3d2ee6] text-white px-6 py-3 rounded-xl text-sm font-semibold flex items-center transition-all shadow-md shadow-indigo-500/20">
             <Unlock size={18} className="mr-2" /> Abrir Caixa
           </button>
        )}
      </div>

      {caixaAberto ? (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 mb-10 flex flex-col md:flex-row gap-6 sm:gap-8 justify-between items-start md:items-center relative overflow-hidden shadow-sm border border-slate-100 dark:border-slate-700">
           <div className="relative z-10 w-full md:w-auto">
             <p className="text-emerald-500 font-bold uppercase tracking-wider text-xs mb-2 flex items-center"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mr-2"></span> Caixa Aberto</p>
             <p className="text-slate-500 text-[14px] sm:text-[15px]">Operador: <span className="font-bold text-slate-900 dark:text-white">{caixaAberto.operador}</span></p>
             <p className="text-slate-500 text-[14px] sm:text-[15px] mt-1">Abertura: {new Date(caixaAberto.dataAbertura).toLocaleString('pt-BR')}</p>
           </div>
           
           <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 md:gap-10 w-full md:w-auto relative z-10">
              <div className="text-left sm:text-right border-b sm:border-0 border-slate-100 dark:border-slate-700 pb-4 sm:pb-0">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Fundo Inicial</p>
                <p className="text-xl sm:text-2xl font-bold text-slate-700 dark:text-slate-300">{formatMoney(caixaAberto.valorInicial)}</p>
              </div>
              <div className="text-left sm:text-right border-b sm:border-0 border-slate-100 dark:border-slate-700 pb-4 sm:pb-0">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Vendas no Caixa</p>
                <p className="text-xl sm:text-2xl font-bold text-emerald-500">+ {formatMoney(totalVendasCaixa)}</p>
              </div>
              <div className="text-left sm:text-right sm:pl-6 md:pl-10 sm:border-l border-slate-100 dark:border-slate-700">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Saldo Atual</p>
                <p className="text-3xl sm:text-4xl font-extrabold text-[#4A3AFF] dark:text-indigo-400">{formatMoney((caixaAberto.valorInicial || 0) + totalVendasCaixa)}</p>
              </div>
           </div>
           <Wallet className="hidden sm:block absolute -bottom-8 -right-8 text-slate-50 dark:text-slate-700/30 w-64 h-64 pointer-events-none" />
        </div>
      ) : (
        <div className="bg-transparent border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl p-8 sm:p-16 mb-10 text-center flex flex-col items-center justify-center">
           <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 mb-5 shadow-sm border border-slate-100 dark:border-slate-700">
             <Lock size={24} />
           </div>
           <h3 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-200 mb-3">Caixa Fechado</h3>
           <p className="text-slate-500 text-[14px] sm:text-[15px] max-w-md mb-8 leading-relaxed">Nenhum caixa está aberto no momento. Abra o caixa para permitir o registro de novas vendas no PDV.</p>
           <button onClick={() => setModalAbrirCaixa(true)} className="bg-[#4A3AFF] hover:bg-[#3d2ee6] text-white px-8 py-3.5 rounded-xl font-bold shadow-md shadow-indigo-500/20 transition-all text-[15px] w-full sm:w-auto">
             Abrir Caixa do Dia
           </button>
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden p-2">
        <div className="p-4 sm:p-5"><h3 className="font-bold text-[15px] sm:text-[16px] text-slate-900 dark:text-white">Histórico (Últimos Fechados)</h3></div>
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-700 text-[11px] text-slate-400 uppercase tracking-wider font-semibold bg-white dark:bg-slate-800">
                <th className="py-4 px-6">Abertura / Fechamento</th>
                <th className="py-4 px-6">Operador</th>
                <th className="py-4 px-6 text-right">Fundo</th>
                <th className="py-4 px-6 text-right">Vendas</th>
                <th className="py-4 px-6 text-right">Saldo Final</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
              {caixas.filter((c:any) => c.status === 'fechado').sort((a:any,b:any)=>new Date(b.dataAbertura).getTime()-new Date(a.dataAbertura).getTime()).slice(0,10).map((c:any) => (
                <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="font-bold text-[13px] sm:text-[14px] text-slate-800 dark:text-slate-200">{new Date(c.dataAbertura).toLocaleDateString('pt-BR')}</div>
                    <div className="text-[11px] sm:text-[12px] text-slate-400 mt-0.5">Fechado: {new Date(c.dataFechamento).toLocaleTimeString('pt-BR')}</div>
                  </td>
                  <td className="py-4 px-6 text-[13px] sm:text-[14px] text-slate-500 font-medium">{c.operador}</td>
                  <td className="py-4 px-6 text-right text-[13px] sm:text-[14px] text-slate-500">{formatMoney(c.valorInicial)}</td>
                  <td className="py-4 px-6 text-right text-[13px] sm:text-[14px] text-emerald-500 font-semibold">+{formatMoney(c.totalVendas)}</td>
                  <td className="py-4 px-6 text-right font-extrabold text-[14px] sm:text-[15px] text-slate-900 dark:text-white">{formatMoney(c.valorFinal)}</td>
                </tr>
              ))}
              {caixas.filter((c:any) => c.status === 'fechado').length === 0 && <tr><td colSpan={5} className="text-center py-10 sm:py-12 text-slate-400 text-[14px] sm:text-[15px]">Nenhum histórico de caixa fechado.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function EstoqueScreen() {
  const { produtos, setModalProduto, handleDelete } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="animate-fade-in max-w-[1100px] mx-auto flex flex-col h-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
        <div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">Estoque</h2>
          <p className="text-[14px] sm:text-[15px] text-slate-500 mt-1 sm:mt-2">Gerencie produtos e níveis de inventário.</p>
        </div>
        <button onClick={() => setModalProduto({ open: true, data: null })} className="w-full sm:w-auto justify-center bg-[#4A3AFF] hover:bg-[#3d2ee6] text-white px-6 py-3 rounded-xl text-[14px] sm:text-[15px] font-semibold flex items-center shadow-md shadow-indigo-500/20 transition-all">
          <Plus size={18} className="mr-2" /> Adicionar Produto
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm flex-1 flex flex-col overflow-hidden p-2 min-h-0">
        <div className="p-4 bg-white dark:bg-slate-800 flex-shrink-0">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar código, marca..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl pl-12 pr-4 py-3 text-[14px] sm:text-[15px] outline-none focus:border-[#4A3AFF] focus:ring-1 focus:ring-[#4A3AFF] transition-all text-slate-900 dark:text-white"
            />
          </div>
        </div>
        <div className="flex-1 overflow-auto custom-scrollbar">
          <table className="w-full text-left min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-700 text-[10px] sm:text-[11px] text-slate-400 uppercase tracking-wider font-semibold sticky top-0 bg-white dark:bg-slate-800 z-10">
                <th className="py-3 sm:py-4 px-4 sm:px-6 w-20 sm:w-24">Cód.</th>
                <th className="py-3 sm:py-4 px-4 sm:px-6">Produto</th>
                <th className="py-3 sm:py-4 px-4 sm:px-6">Categoria</th>
                <th className="py-3 sm:py-4 px-4 sm:px-6 text-right">Venda</th>
                <th className="py-3 sm:py-4 px-4 sm:px-6 text-center w-20 sm:w-28">Qtd</th>
                <th className="py-3 sm:py-4 px-4 sm:px-6 text-center w-20 sm:w-24">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
              {produtos.filter((p:any) => p.codigo?.toLowerCase().includes(searchTerm.toLowerCase()) || p.marca?.toLowerCase().includes(searchTerm.toLowerCase())).map((p:any) => (
                <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                  <td className="py-3 sm:py-4 px-4 sm:px-6 font-mono text-[11px] sm:text-[12px] font-bold text-slate-400">{p.codigo}</td>
                  <td className="py-3 sm:py-4 px-4 sm:px-6">
                    <div className="font-bold text-[13px] sm:text-[14px] text-slate-800 dark:text-slate-200">{p.marca} <span className="font-normal text-slate-500">{p.modelo}</span></div>
                    <div className="text-[11px] sm:text-[12px] text-slate-400 mt-0.5">{p.cor}</div>
                  </td>
                  <td className="py-3 sm:py-4 px-4 sm:px-6 text-[12px] sm:text-[13px]"><span className="bg-slate-100 dark:bg-slate-700 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg font-medium text-slate-700 dark:text-slate-300">{p.categoria}</span></td>
                  <td className="py-3 sm:py-4 px-4 sm:px-6 text-right font-extrabold text-[14px] sm:text-[15px] text-emerald-600 dark:text-emerald-400">{formatMoney(p.venda)}</td>
                  <td className="py-3 sm:py-4 px-4 sm:px-6 text-center">
                    <span className={`inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-xl text-[13px] sm:text-[14px] font-bold ${Number(p.qtd) < Number(p.min) ? 'bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400' : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300'}`}>{p.qtd}</span>
                  </td>
                  <td className="py-3 sm:py-4 px-4 sm:px-6 text-center">
                    <div className="flex justify-center gap-1 sm:gap-2">
                       <button onClick={() => setModalProduto({ open: true, data: p })} className="p-2 sm:p-2.5 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-slate-300 hover:text-[#4A3AFF] transition-colors"><Edit2 size={16} className="sm:w-[18px] sm:h-[18px]" /></button>
                       <button onClick={() => handleDelete('produtos', p.id)} className="p-2 sm:p-2.5 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-900/30 text-slate-300 hover:text-rose-500 transition-colors"><Trash2 size={16} className="sm:w-[18px] sm:h-[18px]" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {produtos.length === 0 && <tr><td colSpan={6} className="text-center py-10 sm:py-12 text-slate-400 text-[14px] sm:text-[15px]">Nenhum produto cadastrado.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ClientesScreen() {
  const { clientes, setModalCliente, handleDelete } = useAppContext();
  
  return (
    <div className="animate-fade-in max-w-[1100px] mx-auto flex flex-col h-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4 flex-shrink-0">
        <div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">Clientes & Receitas</h2>
            <p className="text-[14px] sm:text-[15px] text-slate-500 mt-1 sm:mt-2">Gestão de contatos e prontuários óticos.</p>
        </div>
        <button onClick={() => setModalCliente({ open: true, data: null })} className="w-full sm:w-auto justify-center bg-[#4A3AFF] hover:bg-[#3d2ee6] text-white px-6 py-3 rounded-xl text-[14px] sm:text-[15px] font-semibold flex items-center shadow-md shadow-indigo-500/20 transition-all">
          <Plus size={18} className="mr-2" /> Novo Cliente
        </button>
      </div>
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden p-2 flex-1 min-h-0 flex flex-col">
        <div className="overflow-auto custom-scrollbar flex-1">
            <table className="w-full text-left min-w-[700px]">
            <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700 text-[10px] sm:text-[11px] text-slate-400 uppercase tracking-wider font-semibold sticky top-0 bg-white dark:bg-slate-800 z-10">
                <th className="py-3 sm:py-4 px-4 sm:px-6">Cliente / CPF</th>
                <th className="py-3 sm:py-4 px-4 sm:px-6">Contato</th>
                <th className="py-3 sm:py-4 px-4 sm:px-6">Médico Responsável</th>
                <th className="py-3 sm:py-4 px-4 sm:px-6 text-center">Ações</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                {clientes.map((c:any) => (
                <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                    <td className="py-3 sm:py-4 px-4 sm:px-6">
                    <div className="font-bold text-[13px] sm:text-[14px] text-slate-800 dark:text-slate-200">{c.nome}</div>
                    <div className="text-[11px] sm:text-[12px] text-slate-400 font-mono mt-0.5">{c.cpf || 'Sem CPF'}</div>
                    </td>
                    <td className="py-3 sm:py-4 px-4 sm:px-6 text-[13px] sm:text-[14px] font-medium text-slate-600 dark:text-slate-300">
                    <div className="flex items-center"><MessageCircle size={16} className="text-[#4A3AFF] mr-2"/> {c.tel}</div>
                    </td>
                    <td className="py-3 sm:py-4 px-4 sm:px-6">
                    <div className="text-[13px] sm:text-[14px] font-medium text-slate-700 dark:text-slate-300">{c.prescricao?.medico || 'Não informado'}</div>
                    {c.prescricao?.obs && <div className="text-[11px] sm:text-[12px] text-slate-400 truncate max-w-[200px] mt-0.5">{c.prescricao.obs}</div>}
                    </td>
                    <td className="py-3 sm:py-4 px-4 sm:px-6 text-center">
                    <div className="flex justify-center gap-1 sm:gap-2">
                        <button onClick={() => setModalCliente({ open: true, data: c })} className="p-2 sm:p-2.5 rounded-xl text-slate-400 hover:text-[#4A3AFF] hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"><FileText size={16} className="sm:w-[18px] sm:h-[18px]" /></button>
                        <button onClick={() => handleDelete('clientes', c.id)} className="p-2 sm:p-2.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors"><Trash2 size={16} className="sm:w-[18px] sm:h-[18px]" /></button>
                    </div>
                    </td>
                </tr>
                ))}
                {clientes.length === 0 && <tr><td colSpan={4} className="text-center py-10 sm:py-12 text-slate-400 text-[14px] sm:text-[15px]">Nenhum cliente cadastrado.</td></tr>}
            </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}

function FinanceiroScreen() {
  const { vendas, clientes } = useAppContext();
  
  return (
    <div className="animate-fade-in max-w-[1100px] mx-auto">
      <div className="flex justify-between items-start mb-6 sm:mb-8">
        <div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">Financeiro (DRE)</h2>
          <p className="text-[14px] sm:text-[15px] text-slate-500 mt-1 sm:mt-2">Análise de lucratividade real e CMV.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8">
        <DashCard title="Faturamento Bruto" value={formatMoney(vendas.reduce((a:any,b:any)=>a+(b.total||0),0))} icon={TrendingUp} />
        <DashCard title="CMV (Custo dos Produtos)" value={formatMoney(vendas.reduce((a:any,b:any)=>a+(b.custoBase||0),0))} icon={PackageOpen} color="text-rose-500" />
        <DashCard title="Lucro Bruto" 
          value={formatMoney(vendas.reduce((a:any,b:any)=>a+(b.total||0),0) - vendas.reduce((a:any,b:any)=>a+(b.custoBase||0),0))} 
          icon={ArrowRightLeft} bg="bg-[#4A3AFF]/10 dark:bg-[#4A3AFF]/20" color="text-[#4A3AFF] dark:text-indigo-400" border="border-[#4A3AFF]/20" />
      </div>
      
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden p-2 mt-8">
        <div className="p-4 sm:p-5"><h3 className="font-bold text-[15px] sm:text-[16px] text-slate-900 dark:text-white">Últimas Vendas</h3></div>
        <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left min-w-[600px] sm:min-w-[800px]">
            <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700 text-[10px] sm:text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-3 sm:py-4 px-4 sm:px-6">Data</th>
                <th className="py-3 sm:py-4 px-4 sm:px-6">Cliente</th>
                <th className="py-3 sm:py-4 px-4 sm:px-6">Pagamento</th>
                <th className="py-3 sm:py-4 px-4 sm:px-6 text-right">Total</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                {vendas.slice().sort((a:any,b:any)=>new Date(b.data).getTime()-new Date(a.data).getTime()).slice(0, 10).map((v:any) => (
                <tr key={v.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 sm:py-4 px-4 sm:px-6 text-[13px] sm:text-[14px] text-slate-700 dark:text-slate-300">{new Date(v.data).toLocaleDateString('pt-BR')}</td>
                    <td className="py-3 sm:py-4 px-4 sm:px-6 text-[13px] sm:text-[14px] font-bold text-slate-800 dark:text-slate-200">{clientes.find((c:any)=>c.id===v.cliId)?.nome || 'Balcão'}</td>
                    <td className="py-3 sm:py-4 px-4 sm:px-6 text-[13px] sm:text-[14px]"><span className="bg-slate-100 dark:bg-slate-700 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg font-medium text-slate-600 dark:text-slate-300">{v.pag}</span></td>
                    <td className="py-3 sm:py-4 px-4 sm:px-6 text-right font-extrabold text-[14px] sm:text-[15px] text-[#4A3AFF] dark:text-indigo-400">{formatMoney(v.total)}</td>
                </tr>
                ))}
                {vendas.length === 0 && <tr><td colSpan={4} className="text-center py-10 sm:py-12 text-slate-400 text-[14px] sm:text-[15px]">Nenhuma venda registrada.</td></tr>}
            </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}

function CadastrosGenericosScreen({ activeTab }: { activeTab: string }) {
  const { fornecedores, contas, categorias, usuarios, openGenericModal, handleDelete, configFornecedores, configContas, configCategorias, configUsuarios } = useAppContext();
  
  const getCollectionData = () => {
    switch(activeTab) {
      case 'fornecedores': return fornecedores;
      case 'contas': return contas;
      case 'categorias': return categorias;
      case 'usuarios': return usuarios;
      default: return [];
    }
  };

  const getConfig = () => {
    switch(activeTab) {
      case 'fornecedores': return configFornecedores;
      case 'contas': return configContas;
      case 'categorias': return configCategorias;
      case 'usuarios': return configUsuarios;
      default: return null;
    }
  };

  const data = getCollectionData();
  const config = getConfig();

  return (
    <div className="animate-fade-in max-w-[1100px] mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
        <div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white capitalize">{activeTab}</h2>
          <p className="text-[14px] sm:text-[15px] text-slate-500 mt-1 sm:mt-2">Gestão completa liberada.</p>
        </div>
        <button onClick={() => openGenericModal(config)} className="w-full sm:w-auto justify-center bg-[#4A3AFF] hover:bg-[#3d2ee6] text-white px-6 py-3 rounded-xl text-[14px] sm:text-[15px] font-semibold flex items-center shadow-md shadow-indigo-500/20 transition-all">
          <Plus size={18} className="mr-2" /> Adicionar
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden p-2">
        <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left min-w-[500px] sm:min-w-[600px]">
            <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700 text-[10px] sm:text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-3 sm:py-4 px-4 sm:px-6">Registro Principal</th>
                <th className="py-3 sm:py-4 px-4 sm:px-6">Detalhes</th>
                <th className="py-3 sm:py-4 px-4 sm:px-6 text-center">Ações</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                {data.map((item:any) => (
                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                    <td className="py-3 sm:py-4 px-4 sm:px-6">
                    <div className="font-bold text-[13px] sm:text-[14px] text-slate-800 dark:text-slate-200">{item.nome || item.descricao}</div>
                    <div className="text-[11px] sm:text-[12px] text-slate-400 mt-0.5">{item.cnpj || item.email || (item.vencimento ? `Venc: ${new Date(item.vencimento).toLocaleDateString('pt-BR')}` : '')}</div>
                    </td>
                    <td className="py-3 sm:py-4 px-4 sm:px-6 text-[13px] sm:text-[14px] font-medium text-slate-600 dark:text-slate-300">
                    {item.valor ? <span className={`font-extrabold ${item.tipo==='pagar'?'text-rose-500':'text-emerald-500'}`}>{formatMoney(item.valor)}</span> : (item.contato || item.perfil || item.descricao || '-')}
                    </td>
                    <td className="py-3 sm:py-4 px-4 sm:px-6 text-center">
                    <div className="flex justify-center gap-1 sm:gap-2">
                        <button onClick={() => openGenericModal(config, item)} className="p-2 sm:p-2.5 rounded-xl text-slate-400 hover:text-[#4A3AFF] hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"><Edit2 size={16} className="sm:w-[18px] sm:h-[18px]" /></button>
                        <button onClick={() => handleDelete(activeTab, item.id)} className="p-2 sm:p-2.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors"><Trash2 size={16} className="sm:w-[18px] sm:h-[18px]" /></button>
                    </div>
                    </td>
                </tr>
                ))}
                {data.length === 0 && <tr><td colSpan={3} className="text-center py-10 sm:py-12 text-slate-400 text-[14px] sm:text-[15px]">Nenhum registro encontrado.</td></tr>}
            </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}

function OrcamentosScreen() {
  const { orcamentos, clientes, setActiveTab, handleDelete } = useAppContext();
  
  return (
    <div className="animate-fade-in max-w-[1100px] mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
        <div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">Orçamentos</h2>
          <p className="text-[14px] sm:text-[15px] text-slate-500 mt-1 sm:mt-2">Negociações salvas via PDV.</p>
        </div>
        <button onClick={()=>setActiveTab('vendas')} className="w-full sm:w-auto justify-center bg-[#4A3AFF] hover:bg-[#3d2ee6] text-white px-6 py-3 rounded-xl text-[14px] sm:text-[15px] font-semibold flex items-center shadow-md shadow-indigo-500/20 transition-all">
          Novo via PDV
        </button>
      </div>
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden p-2">
        <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left min-w-[600px] sm:min-w-[800px]">
            <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700 text-[10px] sm:text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-3 sm:py-4 px-4 sm:px-6">Data / Cliente</th>
                <th className="py-3 sm:py-4 px-4 sm:px-6">Itens</th>
                <th className="py-3 sm:py-4 px-4 sm:px-6">Total</th>
                <th className="py-3 sm:py-4 px-4 sm:px-6 text-center">Ações</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                {orcamentos.map((o:any) => (
                <tr key={o.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                    <td className="py-3 sm:py-4 px-4 sm:px-6">
                    <div className="font-bold text-[13px] sm:text-[14px] text-slate-800 dark:text-slate-200">{clientes.find((c:any)=>c.id===o.cliId)?.nome || 'Desconhecido'}</div>
                    <div className="text-[11px] sm:text-[12px] text-slate-400 mt-0.5">{new Date(o.data).toLocaleDateString('pt-BR')}</div>
                    </td>
                    <td className="py-3 sm:py-4 px-4 sm:px-6 text-[13px] sm:text-[14px] font-medium text-slate-600 dark:text-slate-300">
                    {o.itens?.length || 0} produto(s)
                    </td>
                    <td className="py-3 sm:py-4 px-4 sm:px-6 font-extrabold text-[14px] sm:text-[15px] text-amber-500">
                    {formatMoney(o.total)}
                    </td>
                    <td className="py-3 sm:py-4 px-4 sm:px-6 text-center">
                    <div className="flex justify-center gap-2">
                        <button onClick={() => handleDelete('orcamentos', o.id)} className="p-2 sm:p-2.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors" title="Cancelar Orçamento"><Trash2 size={16} className="sm:w-[18px] sm:h-[18px]" /></button>
                    </div>
                    </td>
                </tr>
                ))}
                {orcamentos.length === 0 && <tr><td colSpan={4} className="text-center py-10 sm:py-12 text-slate-400 text-[14px] sm:text-[15px]">Nenhum orçamento pendente.</td></tr>}
            </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Login State
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isDark, setIsDark] = useState(false);

  // Data States
  const [produtos, setProdutos] = useState<any[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [vendas, setVendas] = useState<any[]>([]);
  const [fornecedores, setFornecedores] = useState<any[]>([]);
  const [contas, setContas] = useState<any[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [usuarios, setUsuarios] = useState<any[]>([]); 
  const [orcamentos, setOrcamentos] = useState<any[]>([]); 
  const [caixas, setCaixas] = useState<any[]>([]);

  // Modals States
  const [modalProduto, setModalProduto] = useState({ open: false, data: null });
  const [modalCliente, setModalCliente] = useState({ open: false, data: null });
  const [modalGeneric, setModalGeneric] = useState({ open: false, config: null as any, data: null });
  const [alertConfig, setAlertConfig] = useState({ open: false, title: '', message: '', type: 'info', onConfirm: null as any });
  const [modalAbrirCaixa, setModalAbrirCaixa] = useState(false);
  const [modalFecharCaixa, setModalFecharCaixa] = useState(false);

  // PDV States
  const [pdvSearch, setPdvSearch] = useState('');
  const [carrinho, setCarrinho] = useState<any[]>([]);
  const [pdvCliente, setPdvCliente] = useState('');
  const [pdvPagamento, setPdvPagamento] = useState('Pix');
  const [pdvDesconto, setPdvDesconto] = useState(0);
  
  // Memos
  const caixaAberto = useMemo(() => caixas.find(c => c.status === 'aberto'), [caixas]);
  const vendasDoCaixa = useMemo(() => caixaAberto ? vendas.filter(v => v.caixaId === caixaAberto.id) : [], [vendas, caixaAberto]);
  const totalVendasCaixa = useMemo(() => vendasDoCaixa.reduce((acc, v) => acc + (v.total || 0), 0), [vendasDoCaixa]);

  const pdvFiltered = useMemo(() => {
    const term = pdvSearch.toLowerCase();
    return produtos.filter(p => Number(p.qtd) > 0 && ((p.marca || '').toLowerCase().includes(term) || (p.modelo || '').toLowerCase().includes(term) || (p.codigo || '').toLowerCase().includes(term)));
  }, [produtos, pdvSearch]);

  // Theme
  useEffect(() => {
    const isDarkTheme = localStorage.getItem('otica_theme') === 'dark';
    setIsDark(isDarkTheme);
    if (isDarkTheme) document.documentElement.classList.add('dark');
  }, []);

  const toggleTheme = () => {
    const novoTema = !isDark;
    setIsDark(novoTema);
    localStorage.setItem('otica_theme', novoTema ? 'dark' : 'light');
    if (novoTema) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  };

  // Close mobile menu automatically on navigation
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [activeTab]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async (e: any) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);
    try { await signInWithEmailAndPassword(auth, loginEmail, loginPassword); } 
    catch (error) { setLoginError('Credenciais inválidas. Verifique seu e-mail e senha.'); } 
    finally { setIsLoggingIn(false); }
  };

  const handleLogout = async () => {
    try { await signOut(auth); } catch (error) { console.error("Erro ao sair:", error); }
  };

  useEffect(() => {
    if (!user || user.isAnonymous) return;
    const collections = [
      { name: 'produtos', setter: setProdutos },
      { name: 'clientes', setter: setClientes },
      { name: 'vendas', setter: setVendas },
      { name: 'fornecedores', setter: setFornecedores },
      { name: 'contas', setter: setContas },
      { name: 'categorias', setter: setCategorias },
      { name: 'usuarios', setter: setUsuarios },
      { name: 'orcamentos', setter: setOrcamentos },
      { name: 'caixas', setter: setCaixas }
    ];

    const unsubscribers = collections.map(col => {
      const dbRef = ref(db, `artifacts/${appId}/users/${user.uid}/${col.name}`);
      return onValue(dbRef, (snapshot) => {
        const data: any[] = [];
        snapshot.forEach((childSnapshot) => {
          data.push({ id: childSnapshot.key, ...childSnapshot.val() });
        });
        col.setter(data);
      }, (err) => console.error(`Erro ao carregar ${col.name}:`, err));
    });

    return () => unsubscribers.forEach(unsub => unsub());
  }, [user]);

  const showAlert = (title: string, message: string, type = 'info', onConfirm = null) => {
    setAlertConfig({ open: true, title, message, type, onConfirm });
  };

  const handleDelete = (collectionName: string, id: string) => {
    showAlert("Excluir Permanentemente", "Esta ação não pode ser desfeita. Confirmar exclusão?", "danger", (async () => {
      try { await remove(ref(db, `artifacts/${appId}/users/${user.uid}/${collectionName}/${id}`)); } 
      catch (e) { showAlert("Erro", "Falha ao excluir registro.", "danger"); }
    }) as any);
  };

  const openGenericModal = (config: any, data = null) => {
    setModalGeneric({ open: true, config, data: data || config.defaultData });
  };

  const handleSaveGeneric = async (data: any, collectionName: string) => {
    if (!user) return;
    try {
      if (data.id) {
        const { id, ...saveData } = data;
        await update(ref(db, `artifacts/${appId}/users/${user.uid}/${collectionName}/${id}`), saveData);
      } else {
        await push(ref(db, `artifacts/${appId}/users/${user.uid}/${collectionName}`), data);
      }
      setModalGeneric({ open: false, config: null as any, data: null });
      showAlert("Sucesso", "Registro salvo com sucesso.", "success");
    } catch (e) { showAlert("Erro", "Falha ao salvar registro.", "danger"); }
  };

  // Configurações Genéricas
  const configFornecedores = { title: 'Fornecedor', collection: 'fornecedores', defaultData: { nome: '', cnpj: '', contato: '', email: '' }, fields: [ { name: 'nome', label: 'Nome / Razão Social', type: 'text', required: true }, { name: 'cnpj', label: 'CNPJ', type: 'text' }, { name: 'contato', label: 'Contato (Telefone)', type: 'text' }, { name: 'email', label: 'E-mail', type: 'email' } ] };
  const configContas = { title: 'Conta a Pagar/Receber', collection: 'contas', defaultData: { descricao: '', tipo: 'pagar', valor: 0, vencimento: '', status: 'pendente' }, fields: [ { name: 'descricao', label: 'Descrição', type: 'text', required: true }, { name: 'tipo', label: 'Tipo', type: 'select', options: [{val: 'pagar', label: 'A Pagar'}, {val: 'receber', label: 'A Receber'}] }, { name: 'valor', label: 'Valor (R$)', type: 'number', step: '0.01', required: true }, { name: 'vencimento', label: 'Vencimento', type: 'date', required: true }, { name: 'status', label: 'Status', type: 'select', options: [{val: 'pendente', label: 'Pendente'}, {val: 'pago', label: 'Pago/Recebido'}] } ] };
  const configCategorias = { title: 'Categoria', collection: 'categorias', defaultData: { nome: '', descricao: '' }, fields: [ { name: 'nome', label: 'Nome da Categoria', type: 'text', required: true }, { name: 'descricao', label: 'Descrição Breve', type: 'text' } ] };
  const configUsuarios = { title: 'Usuário', collection: 'usuarios', defaultData: { nome: '', email: '', perfil: 'vendedor', status: 'ativo' }, fields: [ { name: 'nome', label: 'Nome', type: 'text', required: true }, { name: 'email', label: 'E-mail de Acesso', type: 'email', required: true }, { name: 'perfil', label: 'Perfil de Acesso', type: 'select', options: [{val: 'admin', label: 'Administrador'}, {val: 'vendedor', label: 'Vendedor/Caixa'}] }, { name: 'status', label: 'Status', type: 'select', options: [{val: 'ativo', label: 'Ativo'}, {val: 'inativo', label: 'Inativo'}] } ] };

  const handleAbrirCaixa = async (valorFundo: any) => {
    if(!user) return;
    try {
      await push(ref(db, `artifacts/${appId}/users/${user.uid}/caixas`), { dataAbertura: new Date().toISOString(), valorInicial: Number(valorFundo) || 0, status: 'aberto', operador: user.email || 'Usuário' });
      setModalAbrirCaixa(false);
      showAlert("Caixa Aberto", "O caixa do dia foi aberto com sucesso. Boas vendas!", "success");
    } catch(e) { showAlert("Erro", "Não foi possível abrir o caixa.", "danger"); }
  };

  const handleFecharCaixa = async () => {
    if(!user || !caixaAberto) return;
    try {
      await update(ref(db, `artifacts/${appId}/users/${user.uid}/caixas/${caixaAberto.id}`), { status: 'fechado', dataFechamento: new Date().toISOString(), totalVendas: totalVendasCaixa, valorFinal: (caixaAberto.valorInicial || 0) + totalVendasCaixa });
      setModalFecharCaixa(false);
      showAlert("Caixa Fechado", "O caixa foi fechado e os totais foram registrados.", "success");
    } catch (e) { showAlert("Erro", "Não foi possível fechar o caixa.", "danger"); }
  };

  const addToCart = (prod: any) => {
    setCarrinho(prev => {
      const idx = prev.findIndex(c => c.id === prod.id);
      if (idx > -1) {
        const newCart = [...prev];
        if (newCart[idx].qtd < prod.qtd) newCart[idx].qtd++;
        return newCart;
      }
      return [...prev, { ...prod, qtd: 1 }];
    });
  };

  const removeFromCart = (id: string) => setCarrinho(prev => prev.filter(c => c.id !== id));

  const finalizarVenda = async (comoOrcamento = false) => {
    if (carrinho.length === 0 || !user) { showAlert("Carrinho Vazio", "Adicione produtos antes de finalizar.", "danger"); return; }
    if (!comoOrcamento && !caixaAberto) { showAlert("Atenção", "É necessário abrir o caixa do dia antes de registrar vendas.", "danger"); return; }
    
    let subtotal = carrinho.reduce((a, b) => a + (b.venda * b.qtd), 0);
    let custoTotal = carrinho.reduce((a, b) => a + ((Number(b.custo) || 0) * b.qtd), 0);
    let desc = Number(pdvDesconto) || 0;
    if (desc > subtotal) desc = subtotal;

    try {
      if (comoOrcamento) {
        if(!pdvCliente) { showAlert("Atenção", "Para gerar um orçamento é obrigatório vincular um cliente.", "danger"); return; }
        await push(ref(db, `artifacts/${appId}/users/${user.uid}/orcamentos`), {
            cliId: pdvCliente, subtotal, desconto: desc, total: subtotal - desc,
            itens: carrinho.map(c => ({ id: c.id, marca: c.marca, modelo: c.modelo, qtd: c.qtd, venda: c.venda })),
            data: new Date().toISOString(), status: 'pendente'
        });
        showAlert("Orçamento Salvo!", "O orçamento foi registrado com sucesso e não alterou o estoque.", "success");
      } else {
        // Atualização atômica (Multi-path update) para o Realtime Database
        const updates: any = {};
        
        for (let c of carrinho) {
           const produtoBanco = produtos.find(p => p.id === c.id);
           if (!produtoBanco) throw new Error(`Produto não encontrado no sistema.`);
           if (produtoBanco.qtd < c.qtd) throw new Error(`Estoque insuficiente para ${c.marca}.`);
           updates[`artifacts/${appId}/users/${user.uid}/produtos/${c.id}/qtd`] = produtoBanco.qtd - c.qtd;
        }

        const novaVendaRef = push(ref(db, `artifacts/${appId}/users/${user.uid}/vendas`));
        updates[`artifacts/${appId}/users/${user.uid}/vendas/${novaVendaRef.key}`] = { 
           cliId: pdvCliente, pag: pdvPagamento, subtotal, desconto: desc, total: subtotal - desc, custoBase: custoTotal, itens: carrinho.length, data: new Date().toISOString(), caixaId: caixaAberto.id 
        };
        
        await update(ref(db), updates);
        showAlert("Venda Concluída!", "Estoque atualizado e venda registrada.", "success");
      }
      setCarrinho([]); setPdvDesconto(0); setPdvCliente('');
    } catch (e: any) { showAlert("Erro na Venda", e.message || "Ocorreu um erro ao processar a operação.", "danger"); }
  };

  const contextValue = {
    produtos, setProdutos, clientes, setClientes, vendas, setVendas, fornecedores, contas, categorias, usuarios, orcamentos, caixas,
    activeTab, setActiveTab, caixaAberto, totalVendasCaixa, setModalAbrirCaixa, setModalFecharCaixa,
    pdvSearch, setPdvSearch, pdvFiltered, carrinho, addToCart, removeFromCart, pdvCliente, setPdvCliente, pdvDesconto, setPdvDesconto, pdvPagamento, setPdvPagamento, finalizarVenda,
    formatMoney, showAlert, handleDelete, openGenericModal, setModalProduto, setModalCliente,
    configFornecedores, configContas, configCategorias, configUsuarios, mobileMenuOpen, setMobileMenuOpen
  };

  if (loadingAuth) {
    return (
      <div className="fixed inset-0 bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-bold tracking-wide">Iniciando ERP Cloud...</p>
      </div>
    );
  }

  // TELA DE LOGIN CORPORATIVA
  if (!user || user.isAnonymous) {
    return (
      <div className="min-h-screen flex items-stretch bg-slate-50 dark:bg-slate-900 font-sans">
        <div className="hidden lg:flex flex-col w-5/12 bg-[#0A192F] text-white p-12 relative overflow-hidden justify-between">
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[80px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-blue-600/20 rounded-full blur-[80px]"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-16">
              <div className="w-14 h-14 bg-[#4A3AFF] rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30"><Glasses size={32} className="text-white" /></div>
              <div><h1 className="text-2xl font-bold tracking-wide">ÓTICA VISÃO</h1><p className="text-indigo-200 text-sm tracking-[0.2em] font-medium">ERP</p></div>
            </div>
            <div className="mb-10">
              <h2 className="text-4xl font-bold leading-tight mb-4">Gestão completa<br/>para sua ótica<span className="text-[#4A3AFF]">.</span></h2>
              <p className="text-slate-300 text-base max-w-sm leading-relaxed">Controle de estoque, vendas, clientes e relatórios em um único sistema.</p>
            </div>
            <div className="space-y-8">
              <div className="flex items-start gap-4"><div className="w-12 h-12 rounded-full bg-[#112240] flex items-center justify-center shrink-0"><Boxes size={20} className="text-[#4A3AFF]" /></div><div><h3 className="font-bold text-white mb-1">Estoque Inteligente</h3><p className="text-slate-400 text-sm">Controle e organize seus produtos</p></div></div>
              <div className="flex items-start gap-4"><div className="w-12 h-12 rounded-full bg-[#112240] flex items-center justify-center shrink-0"><Users size={20} className="text-[#4A3AFF]" /></div><div><h3 className="font-bold text-white mb-1">Clientes & Vendas</h3><p className="text-slate-400 text-sm">Mais relacionamento, mais resultados</p></div></div>
              <div className="flex items-start gap-4"><div className="w-12 h-12 rounded-full bg-[#112240] flex items-center justify-center shrink-0"><LineChart size={20} className="text-[#4A3AFF]" /></div><div><h3 className="font-bold text-white mb-1">Relatórios Estratégicos</h3><p className="text-slate-400 text-sm">Dados que transformam decisões</p></div></div>
            </div>
          </div>
          <div className="relative z-10 mt-auto pt-10">
             <div className="bg-[#112240] border border-[#1E2D4A] rounded-xl p-4 flex items-center gap-4"><ShieldCheck size={28} className="text-indigo-400 shrink-0" /><div><p className="text-white font-bold text-sm">Ambiente seguro e certificado</p><p className="text-slate-400 text-[11px] mt-0.5">256-bit SSL &bull; Backup diário</p></div></div>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-6 relative bg-[#F8FAFC] dark:bg-slate-900">
          <div className="absolute top-6 right-6 z-50">
            <button onClick={toggleTheme} className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:text-[#4A3AFF] shadow-sm transition-transform hover:scale-105">
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
          <div className="w-full max-w-md">
            <div className="bg-white dark:bg-slate-800 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none p-8 sm:p-10 mb-6 border border-slate-100 dark:border-slate-700/50">
              <div className="text-center mb-10"><div className="w-16 h-16 bg-indigo-50 dark:bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-6 text-[#4A3AFF] dark:text-indigo-400"><ShieldCheck size={28} /></div><h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Bem-vindo(a)</h2><p className="text-slate-500 text-sm">Acesse sua conta para continuar</p></div>
              <form onSubmit={handleLogin} className="space-y-5">
                {loginError && (<div className="bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 p-3.5 rounded-xl text-sm font-bold flex items-start gap-3 border border-rose-100 dark:border-rose-800/30"><AlertTriangle size={18} className="shrink-0 mt-0.5" /><span>{loginError}</span></div>)}
                <div><label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">E-mail Corporativo</label><div className="relative"><div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Mail size={18} className="text-slate-400" /></div><input type="email" required value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pl-12 pr-4 py-3.5 text-[15px] outline-none focus:border-[#4A3AFF] focus:ring-1 focus:ring-[#4A3AFF] transition-all text-slate-900 dark:text-white" placeholder="nome@otica.com.br" /></div></div>
                <div><div className="flex justify-between items-center mb-2"><label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Senha</label></div><div className="relative"><div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Lock size={18} className="text-slate-400" /></div><input type="password" required value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pl-12 pr-4 py-3.5 text-[15px] outline-none focus:border-[#4A3AFF] focus:ring-1 focus:ring-[#4A3AFF] transition-all text-slate-900 dark:text-white" placeholder="••••••••" /></div></div>
                <button type="submit" disabled={isLoggingIn} className="w-full bg-[#4A3AFF] hover:bg-[#3d2ee6] text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all flex items-center justify-center disabled:opacity-70 mt-6 gap-2">
                  {isLoggingIn ? 'Autenticando...' : <><Lock size={18} /> Acessar Sistema <ChevronRight size={18} className="ml-1" /></>}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AppContext.Provider value={contextValue}>
      <div className={`antialiased h-screen flex overflow-hidden ${isDark ? 'dark bg-slate-900' : 'bg-slate-50'} text-slate-900 dark:text-slate-100 text-sm font-sans`}>
        
        {/* SIDEBAR CORPORATIVA (Desktop) */}
        <aside className="hidden md:flex flex-col w-[270px] bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700/50 z-20 flex-shrink-0 justify-between">
          <div className="flex flex-col h-full overflow-hidden">
            <div className="h-[80px] flex items-center px-6 border-b border-slate-100 dark:border-slate-700/50 flex-shrink-0">
              <div className="w-10 h-10 rounded-xl bg-[#4A3AFF] text-white flex items-center justify-center mr-3 shadow-md flex-shrink-0"><Glasses size={24} /></div>
              <div className="flex flex-col justify-center">
                <span className="font-bold text-[16px] leading-tight tracking-tight text-slate-900 dark:text-white">Ótica Visão</span>
                <span className="text-[12px] text-slate-500 dark:text-slate-400 font-medium">ERP Cloud</span>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1 custom-scrollbar">
              <SidebarItem icon={Home} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
              <SidebarCategory label="Operação" />
              <SidebarItem icon={Wallet} label="Caixa Diário" active={activeTab === 'caixa'} onClick={() => setActiveTab('caixa')} badge={caixaAberto ? 'Aberto' : 'Fechado'} badgeColor={caixaAberto ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'} />
              <SidebarItem icon={ShoppingCart} label="PDV (Ponto de Venda)" active={activeTab === 'vendas'} onClick={() => setActiveTab('vendas')} />
              <SidebarItem icon={TrendingUp} label="Vendas e Despesas" active={activeTab === 'financeiro'} onClick={() => setActiveTab('financeiro')} />
              <SidebarItem icon={FileText} label="Orçamentos" active={activeTab === 'orcamentos'} onClick={() => setActiveTab('orcamentos')} badge={orcamentos.filter((o:any)=>o.status==='pendente').length || null} badgeColor="bg-amber-100 text-amber-700" />
              <SidebarItem icon={ArrowRightLeft} label="Contas a Pagar/Receber" active={activeTab === 'contas'} onClick={() => setActiveTab('contas')} />
              
              <SidebarCategory label="Cadastros" />
              <SidebarItem icon={Boxes} label="Estoque" active={activeTab === 'estoque'} onClick={() => setActiveTab('estoque')} badge={produtos.filter((p:any)=>Number(p.qtd)<Number(p.min)).length > 0 ? produtos.filter((p:any)=>Number(p.qtd)<Number(p.min)).length : null} badgeColor="bg-rose-100 text-rose-700" />
              <SidebarItem icon={Users} label="Clientes" active={activeTab === 'clientes'} onClick={() => setActiveTab('clientes')} />
              <SidebarItem icon={Truck} label="Fornecedores" active={activeTab === 'fornecedores'} onClick={() => setActiveTab('fornecedores')} />
              <SidebarItem icon={Tags} label="Categorias" active={activeTab === 'categorias'} onClick={() => setActiveTab('categorias')} />
              
              <SidebarCategory label="Gestão" />
              <SidebarItem icon={UserPlus} label="Usuários" active={activeTab === 'usuarios'} onClick={() => setActiveTab('usuarios')} />
            </div>
          </div>
          
          <div className="p-4 border-t border-slate-100 dark:border-slate-700/80 flex-shrink-0 w-full bg-white dark:bg-slate-800">
            <div className="flex items-center min-w-0 justify-between">
              <div className="flex items-center min-w-0">
                <div className="w-10 h-10 flex-shrink-0 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-[#4A3AFF] dark:text-indigo-400 flex items-center justify-center font-bold text-[14px] mr-3">
                  {user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[14px] font-bold leading-tight truncate text-slate-900 dark:text-white">{user?.email ? user.email.split('@')[0] : 'Usuário'}</span>
                  <span className="text-[10px] text-emerald-500 font-bold uppercase flex items-center gap-1 mt-0.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Online</span>
                </div>
              </div>
              <button onClick={handleLogout} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors flex-shrink-0 ml-2" title="Sair">
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </aside>

        {/* CONTENT AREA (Dynamic) */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative bg-slate-50 dark:bg-slate-900 pb-[70px] md:pb-0">
          <div className="absolute top-4 right-4 sm:top-6 sm:right-8 z-40 flex gap-2">
            <button onClick={toggleTheme} className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:text-[#4A3AFF] shadow-sm transition-transform hover:scale-105">
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>

          <main className="flex-1 overflow-y-auto p-4 pt-16 sm:pt-10 sm:p-10 lg:p-12 relative z-10 custom-scrollbar h-full">
            {activeTab === 'dashboard' && <DashboardScreen />}
            {activeTab === 'vendas' && <PdvScreen />}
            {activeTab === 'caixa' && <CaixaScreen />}
            {activeTab === 'estoque' && <EstoqueScreen />}
            {activeTab === 'clientes' && <ClientesScreen />}
            {activeTab === 'financeiro' && <FinanceiroScreen />}
            {activeTab === 'orcamentos' && <OrcamentosScreen />}
            {['fornecedores', 'contas', 'categorias', 'usuarios'].includes(activeTab) && <CadastrosGenericosScreen activeTab={activeTab} />}
          </main>

          {/* MOBILE BOTTOM NAVIGATION (Apenas Android/iOS) */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center px-1 pb-safe pt-1 z-[55] h-[70px] shadow-[0_-4px_20px_rgba(0,0,0,0.05)] dark:shadow-none">
             <BottomNavItem icon={Home} label="Início" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
             <BottomNavItem icon={ShoppingCart} label="PDV" active={activeTab === 'vendas'} onClick={() => setActiveTab('vendas')} badge={carrinho.length} />
             <BottomNavItem icon={Boxes} label="Estoque" active={activeTab === 'estoque'} onClick={() => setActiveTab('estoque')} />
             <BottomNavItem icon={Users} label="Clientes" active={activeTab === 'clientes'} onClick={() => setActiveTab('clientes')} />
             <BottomNavItem icon={Menu} label="Menu" active={mobileMenuOpen} onClick={() => setMobileMenuOpen(!mobileMenuOpen)} />
          </div>

          {/* MOBILE MENU DRAWER (Lateral Celular) */}
          {mobileMenuOpen && (
             <div className="md:hidden fixed inset-0 z-[70] bg-slate-900/60 backdrop-blur-sm flex justify-end" onClick={() => setMobileMenuOpen(false)}>
                <div className="w-[80%] max-w-[300px] bg-white dark:bg-slate-800 h-full flex flex-col shadow-2xl animate-fade-in" onClick={e => e.stopPropagation()}>
                  <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                     <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-xl bg-[#4A3AFF] text-white flex items-center justify-center shadow-md"><Glasses size={20} /></div>
                       <span className="font-bold text-[15px] text-slate-900 dark:text-white">Menu</span>
                     </div>
                     <button onClick={() => setMobileMenuOpen(false)} className="p-2 bg-slate-200 dark:bg-slate-700 rounded-full text-slate-500 hover:text-rose-500"><X size={18} /></button>
                  </div>
                  <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
                      <SidebarCategory label="Operação" />
                      <SidebarItem icon={Wallet} label="Caixa Diário" active={activeTab === 'caixa'} onClick={() => setActiveTab('caixa')} badge={caixaAberto ? 'Aberto' : 'Fechado'} badgeColor={caixaAberto ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'} />
                      <SidebarItem icon={TrendingUp} label="Financeiro" active={activeTab === 'financeiro'} onClick={() => setActiveTab('financeiro')} />
                      <SidebarItem icon={FileText} label="Orçamentos" active={activeTab === 'orcamentos'} onClick={() => setActiveTab('orcamentos')} badge={orcamentos.filter((o:any)=>o.status==='pendente').length || null} badgeColor="bg-amber-100 text-amber-700" />
                      <SidebarItem icon={ArrowRightLeft} label="Contas a Pagar" active={activeTab === 'contas'} onClick={() => setActiveTab('contas')} />
                      
                      <SidebarCategory label="Cadastros" />
                      <SidebarItem icon={Truck} label="Fornecedores" active={activeTab === 'fornecedores'} onClick={() => setActiveTab('fornecedores')} />
                      <SidebarItem icon={Tags} label="Categorias" active={activeTab === 'categorias'} onClick={() => setActiveTab('categorias')} />
                      <SidebarItem icon={UserPlus} label="Usuários" active={activeTab === 'usuarios'} onClick={() => setActiveTab('usuarios')} />
                  </div>
                  <div className="p-5 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                     <span className="font-bold text-sm text-slate-600 dark:text-slate-300 truncate mr-2">{user?.email?.split('@')[0]}</span>
                     <button onClick={handleLogout} className="text-slate-400 hover:text-rose-500 bg-white dark:bg-slate-800 p-2.5 rounded-xl shadow-sm"><LogOut size={18} /></button>
                  </div>
                </div>
             </div>
          )}
        </div>

        {modalAbrirCaixa && (
          <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-sm sm:p-4">
            <form onSubmit={(e:any) => { e.preventDefault(); handleAbrirCaixa(e.target.fundo.value); }} className="bg-white dark:bg-slate-800 rounded-t-[32px] sm:rounded-[32px] p-6 sm:p-8 max-w-sm w-full shadow-2xl animate-fade-in border border-slate-100 dark:border-slate-700 pb-8">
               <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-indigo-50 text-[#4A3AFF] dark:bg-indigo-900/30 flex items-center justify-center mb-6"><Unlock size={24} /></div>
               <h3 className="text-xl sm:text-2xl font-bold mb-2 text-slate-900 dark:text-white">Abrir Caixa</h3>
               <p className="text-slate-500 text-[14px] sm:text-[15px] mb-6 leading-relaxed">Informe o valor de fundo de caixa (troco inicial) para iniciar as operações.</p>
               <div className="mb-6 sm:mb-8">
                  <label className="text-[11px] sm:text-[12px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Fundo de Caixa (R$)</label>
                  <input name="fundo" type="number" step="0.01" min="0" required defaultValue="0" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-4 text-xl font-bold outline-none focus:border-[#4A3AFF] focus:ring-2 focus:ring-[#4A3AFF]/20 transition-all text-slate-900 dark:text-white" />
               </div>
               <div className="flex gap-3 sm:gap-4">
                 <button type="button" onClick={() => setModalAbrirCaixa(false)} className="flex-1 py-3.5 sm:py-4 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl font-bold text-slate-600 dark:text-slate-300 transition-colors text-[14px] sm:text-[15px]">Cancelar</button>
                 <button type="submit" className="flex-1 py-3.5 sm:py-4 bg-[#4A3AFF] hover:bg-[#3d2ee6] text-white rounded-xl font-bold transition-all shadow-md shadow-indigo-500/20 text-[14px] sm:text-[15px]">Abrir Caixa</button>
               </div>
            </form>
          </div>
        )}

        {modalFecharCaixa && (
          <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-sm sm:p-4">
            <div className="bg-white dark:bg-slate-800 rounded-t-[32px] sm:rounded-[32px] p-6 sm:p-8 max-w-sm w-full shadow-2xl animate-fade-in border border-slate-100 dark:border-slate-700 pb-8">
               <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-rose-50 text-rose-500 dark:bg-rose-900/30 flex items-center justify-center mb-6"><Archive size={24} /></div>
               <h3 className="text-xl sm:text-2xl font-bold mb-2 text-slate-900 dark:text-white">Confirmar Fechamento</h3>
               <p className="text-slate-500 text-[14px] sm:text-[15px] mb-6 leading-relaxed">Confira os valores antes de fechar o caixa do dia. O PDV ficará bloqueado.</p>
               <div className="bg-slate-50 dark:bg-slate-900/50 p-4 sm:p-5 rounded-2xl mb-6 sm:mb-8 border border-slate-100 dark:border-slate-700">
                 <div className="flex justify-between text-[14px] sm:text-[15px] mb-3"><span className="text-slate-500 font-medium">Fundo Inicial</span><span className="font-bold text-slate-700 dark:text-slate-200">{formatMoney(caixaAberto?.valorInicial)}</span></div>
                 <div className="flex justify-between text-[14px] sm:text-[15px] mb-4 sm:mb-5"><span className="text-slate-500 font-medium">Vendas (Entradas)</span><span className="font-bold text-emerald-500">+{formatMoney(totalVendasCaixa)}</span></div>
                 <div className="flex justify-between items-end border-t border-slate-200 dark:border-slate-600 pt-4"><span className="font-bold text-slate-900 dark:text-white text-[15px] sm:text-[16px]">Saldo Final</span><span className="font-black text-xl sm:text-2xl text-[#4A3AFF] dark:text-indigo-400 leading-none">{formatMoney((caixaAberto?.valorInicial || 0) + totalVendasCaixa)}</span></div>
               </div>
               <div className="flex gap-3 sm:gap-4">
                 <button onClick={() => setModalFecharCaixa(false)} className="flex-1 py-3.5 sm:py-4 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl font-bold text-slate-600 dark:text-slate-300 transition-colors text-[14px] sm:text-[15px]">Cancelar</button>
                 <button onClick={handleFecharCaixa} className="flex-1 py-3.5 sm:py-4 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold transition-all shadow-md shadow-rose-500/20 text-[14px] sm:text-[15px]">Confirmar</button>
               </div>
            </div>
          </div>
        )}

        {/* MODAIS DE FORMULÁRIO */}
        <ModalBase open={modalCliente.open} onClose={() => setModalCliente({ open: false, data: null })} title="Ficha Clínica do Cliente" width="max-w-4xl">
          <FormCliente data={modalCliente.data} 
            onSave={async (data:any) => {
              if (!user) return;
              try {
                if (modalCliente.data?.id) await update(ref(db, `artifacts/${appId}/users/${user.uid}/clientes/${modalCliente.data.id}`), data);
                else await push(ref(db, `artifacts/${appId}/users/${user.uid}/clientes`), data);
                setModalCliente({ open: false, data: null });
                showAlert("Sucesso", "Ficha salva corretamente.", "success");
              } catch (e) { showAlert("Erro", "Falha ao salvar cliente.", "danger"); }
            }}
            onClose={() => setModalCliente({ open: false, data: null })} 
          />
        </ModalBase>

        <ModalBase open={modalProduto.open} onClose={() => setModalProduto({ open: false, data: null })} title="Novo Produto" width="max-w-2xl">
          <FormProduto data={modalProduto.data}
            onSave={async (data:any) => {
               if(!user) return;
               try {
                  if(modalProduto.data?.id) await update(ref(db, `artifacts/${appId}/users/${user.uid}/produtos/${modalProduto.data.id}`), data);
                  else await push(ref(db, `artifacts/${appId}/users/${user.uid}/produtos`), data);
                  setModalProduto({open:false, data:null});
                  showAlert("Sucesso", "Produto registrado.", "success");
               } catch(e) { showAlert("Erro", "Falha ao salvar produto.", "danger"); }
            }}
            onClose={() => setModalProduto({ open: false, data: null })}
          />
        </ModalBase>

        <ModalBase open={modalGeneric.open} onClose={() => setModalGeneric({ open: false, config: null as any, data: null })} title={modalGeneric.config?.title ? `Gestão de ${modalGeneric.config.title}` : ''} width="max-w-xl">
          {modalGeneric.config && (
             <GenericForm config={modalGeneric.config} initialData={modalGeneric.data} onSave={(data:any) => handleSaveGeneric(data, modalGeneric.config.collection)} onClose={() => setModalGeneric({ open: false, config: null as any, data: null })} />
          )}
        </ModalBase>

        {/* ALERT MODAL GLOBAIS */}
        {alertConfig.open && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-800 rounded-[32px] p-6 sm:p-8 max-w-sm w-full text-center shadow-2xl animate-fade-in border border-slate-100 dark:border-slate-700">
               <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full mx-auto flex items-center justify-center mb-6 shadow-sm border ${alertConfig.type === 'danger' ? 'bg-rose-50 text-rose-500 border-rose-100 dark:bg-rose-900/20 dark:border-rose-800' : 'bg-indigo-50 text-[#4A3AFF] border-indigo-100 dark:bg-indigo-900/20 dark:border-indigo-800'}`}>
                  {alertConfig.type === 'danger' ? <AlertTriangle size={32} /> : alertConfig.type === 'success' ? <Check size={32} /> : <Bell size={32} />}
               </div>
               <h3 className="text-xl sm:text-2xl font-bold mb-3 text-slate-900 dark:text-white">{alertConfig.title}</h3>
               <p className="text-slate-500 text-[14px] sm:text-[15px] mb-8 leading-relaxed">{alertConfig.message}</p>
               <div className="flex gap-3 sm:gap-4">
                 <button onClick={() => setAlertConfig({ ...alertConfig, open: false })} className="flex-1 py-3.5 sm:py-4 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl font-bold text-slate-600 dark:text-slate-300 transition-colors text-[14px] sm:text-[15px]">
                   {alertConfig.onConfirm ? 'Cancelar' : 'Entendi'}
                 </button>
                 {alertConfig.onConfirm && (
                   <button onClick={() => { alertConfig.onConfirm(); setAlertConfig({ ...alertConfig, open: false }); }} className={`flex-1 py-3.5 sm:py-4 rounded-xl font-bold text-white transition-all shadow-md text-[14px] sm:text-[15px] ${alertConfig.type==='danger'?'bg-rose-500 hover:bg-rose-600 shadow-rose-500/20':'bg-[#4A3AFF] hover:bg-[#3d2ee6] shadow-indigo-500/20'}`}>
                     Confirmar
                   </button>
                 )}
               </div>
            </div>
          </div>
        )}

      </div>
    </AppContext.Provider>
  );
}
