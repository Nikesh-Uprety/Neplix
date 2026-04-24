
// Nepalix Admin — All Page Components
// Requires nepalix-ui.jsx loaded first

const { I, Btn, Badge, Card, Input, Select, ProgressBar, Stat, Table, SectionHeader, Avatar, Toast, Modal, SidebarItem, cn, fmtNPR, fmtDate } = window;
const { useState, useEffect, useRef } = React;

// ── MOCK DATA ────────────────────────────────────────────────────────────────
const ORDERS = [
  { id:'ORD-2841', customer:'Aarav Sharma', items:3, total:4200, status:'delivered', date:'2026-04-22', location:'Kathmandu' },
  { id:'ORD-2840', customer:'Priya Thapa', items:1, total:1800, status:'processing', date:'2026-04-22', location:'Lalitpur' },
  { id:'ORD-2839', customer:'Bikash Rai', items:2, total:6500, status:'pending', date:'2026-04-21', location:'Bhaktapur' },
  { id:'ORD-2838', customer:'Sita Gurung', items:4, total:9200, status:'delivered', date:'2026-04-21', location:'Pokhara' },
  { id:'ORD-2837', customer:'Rajan KC', items:1, total:2200, status:'cancelled', date:'2026-04-20', location:'Kathmandu' },
  { id:'ORD-2836', customer:'Anita Basnet', items:2, total:3400, status:'processing', date:'2026-04-20', location:'Lalitpur' },
  { id:'ORD-2835', customer:'Sunil Magar', items:5, total:11500, status:'delivered', date:'2026-04-19', location:'Pokhara' },
];

const PRODUCTS = [
  { id:'P001', name:'Merino Wool Sweater', sku:'MWS-BLK-M', stock:12, price:3200, category:'Apparel', status:'active' },
  { id:'P002', name:'Leather Crossbody Bag', sku:'LCB-BRN', stock:5, price:8500, category:'Accessories', status:'active' },
  { id:'P003', name:'Silk Scarf – Crimson', sku:'SS-RED', stock:0, price:1800, category:'Accessories', status:'out_of_stock' },
  { id:'P004', name:'Canvas Tote – Natural', sku:'CT-NAT', stock:28, price:1200, category:'Accessories', status:'active' },
  { id:'P005', name:'Denim Jacket – Indigo', sku:'DJ-IND-L', stock:3, price:5600, category:'Apparel', status:'low_stock' },
  { id:'P006', name:'Cashmere Beanie', sku:'CB-GRY', stock:15, price:2400, category:'Apparel', status:'active' },
];

const CUSTOMERS = [
  { id:'C001', name:'Aarav Sharma', email:'aarav@example.com', phone:'+977 98012 34567', orders:14, spent:58400, since:'Jan 2024', location:'Kathmandu' },
  { id:'C002', name:'Priya Thapa', email:'priya@example.com', phone:'+977 98112 45678', orders:7, spent:22100, since:'Mar 2024', location:'Lalitpur' },
  { id:'C003', name:'Bikash Rai', email:'bikash@example.com', phone:'+977 97812 56789', orders:3, spent:9800, since:'Aug 2024', location:'Bhaktapur' },
  { id:'C004', name:'Sita Gurung', email:'sita@example.com', phone:'+977 98012 67890', orders:22, spent:104300, since:'Dec 2023', location:'Pokhara' },
  { id:'C005', name:'Rajan KC', email:'rajan@example.com', phone:'+977 98112 78901', orders:1, spent:2200, since:'Apr 2026', location:'Kathmandu' },
];

const STAFF = [
  { name:'Aarav Sharma', role:'Owner', email:'aarav@rareatelier.com', status:'active', lastLogin:'Today' },
  { name:'Priya Thapa', role:'Manager', email:'priya@rareatelier.com', status:'active', lastLogin:'Yesterday' },
  { name:'Bikash Rai', role:'Cashier', email:'bikash@rareatelier.com', status:'active', lastLogin:'2d ago' },
  { name:'Sita Gurung', role:'CSR', email:'sita@rareatelier.com', status:'inactive', lastLogin:'2w ago' },
];

const BILLING_HISTORY = [
  { date:'Apr 1, 2026', desc:'Growth Plan — Monthly', amount:999, status:'paid', inv:'INV-0042' },
  { date:'Mar 1, 2026', desc:'Growth Plan — Monthly', amount:999, status:'paid', inv:'INV-0038' },
  { date:'Feb 1, 2026', desc:'Growth Plan — Monthly', amount:999, status:'paid', inv:'INV-0031' },
  { date:'Jan 1, 2026', desc:'Growth Plan — Monthly', amount:999, status:'paid', inv:'INV-0024' },
  { date:'Dec 1, 2025', desc:'Starter Plan — Monthly', amount:499, status:'paid', inv:'INV-0018' },
];

const SA_TENANTS = [
  { name:'Rare Atelier', owner:'Aarav Sharma', plan:'Growth', status:'active', mrr:999, orders:412, since:'Dec 2023', store:'rareatelier.com' },
  { name:'Himalayan Craft', owner:'Priya Tamang', plan:'Starter', status:'active', mrr:499, orders:87, since:'Feb 2024', store:'himalayan-craft.np' },
  { name:'Kathmandu Threads', owner:'Rohan Shrestha', plan:'Pro', status:'active', mrr:1999, orders:1203, since:'Oct 2023', store:'ktm-threads.com' },
  { name:'Everest Goods', owner:'Nisha Basnet', plan:'Growth', status:'trial', mrr:0, orders:12, since:'Apr 2026', store:'everestgoods.np' },
  { name:'Pokhara Prints', owner:'Suman Adhikari', plan:'Starter', status:'suspended', mrr:499, orders:34, since:'Jun 2024', store:'pokharaprints.np' },
  { name:'Nepali Nomad', owner:'Anita Rai', plan:'Growth', status:'active', mrr:999, orders:228, since:'Mar 2024', store:'nepalinomad.com' },
];

// ── STATUS BADGE HELPERS ─────────────────────────────────────────────────────
const OrderBadge = ({ s }) => {
  const m = { delivered:['success','Delivered'], processing:['info','Processing'], pending:['warning','Pending'], cancelled:['danger','Cancelled'] };
  const [v,l] = m[s]||['default',s];
  return <Badge variant={v}>{l}</Badge>;
};

const StockBadge = ({ s }) => {
  const m = { active:['success','Active'], out_of_stock:['danger','Out of Stock'], low_stock:['warning','Low Stock'] };
  const [v,l] = m[s]||['default',s];
  return <Badge variant={v}>{l}</Badge>;
};

const TenantBadge = ({ s }) => {
  const m = { active:['success','Active'], trial:['info','Trial'], suspended:['danger','Suspended'] };
  const [v,l] = m[s]||['default',s];
  return <Badge variant={v}>{l}</Badge>;
};

// ─────────────────────────────────────────────────────────────────────────────
// BILLING PAGE ★ HERO
// ─────────────────────────────────────────────────────────────────────────────
const BillingPage = () => {
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [selectedPlan, setSelectedPlan] = useState('growth');
  const [showPayModal, setShowPayModal] = useState(false);
  const trialDays = 11;
  const plans = [
    { id:'starter', name:'Starter', monthly:499, annual:399, color:'#6B7280',
      features:['Up to 50 products','100 orders/month','1 staff account','Basic analytics','Nepalix POS','Online store','Email support'] },
    { id:'growth', name:'Growth', monthly:999, annual:799, color:'#5B4FF9', popular:true,
      features:['Up to 500 products','Unlimited orders','5 staff accounts','Advanced analytics','Nepalix POS','Custom domain','Priority support','Promo codes','Marketing tools'] },
    { id:'pro', name:'Pro', monthly:1999, annual:1599, color:'#D97706',
      features:['Unlimited products','Unlimited orders','Unlimited staff','Real-time analytics','Multi-terminal POS','Custom domain','24/7 phone support','API access','White-label option','Advanced reports'] },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Trial banner */}
      <div className="rounded-xl border border-[#FDE68A] bg-gradient-to-r from-[#FFFBEB] to-[#FEF3C7] p-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#F59E0B]/20 flex items-center justify-center flex-shrink-0"><I.Zap size={16} style={{color:'#D97706'}}/></div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[#92400E]">{trialDays} days left in your free trial</p>
          <p className="text-xs text-[#B45309]">Add a payment method to keep your store running after Apr 30, 2026.</p>
        </div>
        <Btn variant="warning" size="sm" onClick={()=>setShowPayModal(true)} className="flex-shrink-0 bg-[#D97706] text-white hover:bg-[#B45309]">Add Payment</Btn>
      </div>

      {/* Current plan + usage */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-1 p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#9CA3AF]">Current Plan</p>
              <h2 className="text-2xl font-black text-[#111827] mt-0.5 tracking-tight">Growth</h2>
            </div>
            <Badge variant="success">Active</Badge>
          </div>
          <div className="text-3xl font-black text-[#5B4FF9] mb-1">रू 999<span className="text-base font-semibold text-[#9CA3AF]">/mo</span></div>
          <p className="text-xs text-[#6B7280] mb-4">Next billing: May 1, 2026</p>
          <div className="space-y-2 pt-4 border-t border-[#F3F4F6]">
            {['500 products','Unlimited orders','5 staff accounts','Priority support'].map(f=>(
              <div key={f} className="flex items-center gap-2 text-xs text-[#374151]">
                <I.Check size={13} className="text-[#16A34A]"/>
                {f}
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-[#F3F4F6] space-y-2">
            <Btn variant="outline" size="sm" className="w-full justify-center">Change Plan</Btn>
            <Btn variant="ghost" size="sm" className="w-full justify-center text-[#DC2626] hover:bg-[#FEE2E2]">Cancel Subscription</Btn>
          </div>
        </Card>

        <Card className="lg:col-span-2 p-5">
          <p className="text-[10px] font-black uppercase tracking-widest text-[#9CA3AF] mb-4">Usage This Month</p>
          <div className="space-y-4">
            {[
              { label:'Products', used:127, max:500, color:'#5B4FF9' },
              { label:'Orders', used:312, max:'Unlimited', color:'#16A34A' },
              { label:'Staff Accounts', used:3, max:5, color:'#D97706' },
              { label:'Storage', used:2.3, max:10, unit:'GB', color:'#2563EB' },
              { label:'API Calls', used:8420, max:50000, color:'#7C3AED' },
            ].map(({ label, used, max, color, unit='' })=>(
              <div key={label}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-[#374151]">{label}</span>
                  <span className="text-xs text-[#6B7280] font-mono">{used}{unit} / {max==='Unlimited'?<span className="text-[#16A34A]">∞</span>:`${max}${unit}`}</span>
                </div>
                <ProgressBar value={max==='Unlimited'?15:used} max={max==='Unlimited'?100:max} color={color}/>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Payment method */}
      <Card className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-[#9CA3AF] mb-1">Payment Method</p>
            <div className="flex items-center gap-3 mt-2">
              <div className="w-10 h-7 rounded border border-[#E5E7EB] bg-[#F9FAFB] flex items-center justify-center text-[9px] font-black text-[#374151]">eSewa</div>
              <div>
                <p className="text-sm font-semibold text-[#111827]">eSewa Wallet</p>
                <p className="text-xs text-[#6B7280]">98012345678 · Verified</p>
              </div>
              <Badge variant="success">Default</Badge>
            </div>
          </div>
          <Btn variant="secondary" size="sm" onClick={()=>setShowPayModal(true)}>Update</Btn>
        </div>
      </Card>

      {/* Billing history */}
      <Card>
        <div className="px-5 py-4 border-b border-[#F3F4F6] flex items-center justify-between">
          <p className="text-sm font-bold text-[#111827]">Billing History</p>
          <Btn variant="ghost" size="sm"><I.DL size={13}/>Export</Btn>
        </div>
        <Table
          headers={['Date','Description','Amount','Status','Invoice']}
          rows={BILLING_HISTORY.map(b=>[
            <span className="text-xs text-[#6B7280]">{b.date}</span>,
            <span className="text-sm text-[#374151]">{b.desc}</span>,
            <span className="font-mono font-semibold text-[#111827]">{fmtNPR(b.amount)}</span>,
            <Badge variant="success">{b.status}</Badge>,
            <button className="flex items-center gap-1 text-[#5B4FF9] text-xs font-semibold hover:underline"><I.DL size={12}/>{b.inv}</button>
          ])}
        />
      </Card>

      {/* Plan comparison */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-bold text-[#111827]">Available Plans</p>
          <div className="flex items-center gap-1 p-1 bg-[#F3F4F6] rounded-lg">
            {['monthly','annual'].map(c=>(
              <button key={c} onClick={()=>setBillingCycle(c)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${billingCycle===c?'bg-white text-[#111827] shadow-sm':'text-[#6B7280]'}`}>
                {c==='annual'?'Annual (Save 20%)':'Monthly'}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map(plan=>(
            <Card key={plan.id} className={`p-5 relative transition-all ${selectedPlan===plan.id?`ring-2 ring-[${plan.color}]`:''} ${plan.popular?'border-[#5B4FF9]':''}`}
              style={selectedPlan===plan.id?{boxShadow:`0 0 0 2px ${plan.color}`}:{}}>
              {plan.popular && <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-[#5B4FF9] text-white text-[10px] font-black rounded-full tracking-wide">MOST POPULAR</div>}
              <div className="mb-4">
                <p className="text-sm font-black text-[#111827]" style={{color:plan.color}}>{plan.name}</p>
                <div className="mt-1">
                  <span className="text-3xl font-black text-[#111827]">{fmtNPR(billingCycle==='monthly'?plan.monthly:plan.annual)}</span>
                  <span className="text-xs text-[#9CA3AF]">/mo</span>
                </div>
                {billingCycle==='annual' && <p className="text-[10px] text-[#16A34A] font-semibold mt-0.5">Save रू {(plan.monthly-plan.annual)*12}/yr</p>}
              </div>
              <div className="space-y-1.5 mb-4">
                {plan.features.map(f=>(
                  <div key={f} className="flex items-start gap-1.5 text-xs text-[#374151]">
                    <I.Check size={12} className="flex-shrink-0 mt-0.5" style={{color:plan.color}}/>
                    {f}
                  </div>
                ))}
              </div>
              <Btn onClick={()=>setSelectedPlan(plan.id)} size="sm" className="w-full justify-center"
                variant={selectedPlan===plan.id?'primary':'secondary'}>
                {selectedPlan===plan.id?'Current Plan':'Select Plan'}
              </Btn>
            </Card>
          ))}
        </div>
      </div>

      {/* Payment modal */}
      <Modal open={showPayModal} onClose={()=>setShowPayModal(false)} title="Update Payment Method">
        <div className="space-y-4">
          <p className="text-sm text-[#6B7280]">Choose your preferred payment method for billing.</p>
          {[
            {id:'esewa',label:'eSewa',desc:'Nepal\'s most popular digital wallet'},
            {id:'khalti',label:'Khalti',desc:'Pay with Khalti wallet'},
            {id:'card',label:'Credit / Debit Card',desc:'Visa, Mastercard accepted'},
            {id:'fonepay',label:'FonePay',desc:'Direct bank transfer via FonePay QR'},
          ].map(m=>(
            <div key={m.id} className="flex items-center gap-3 p-3 rounded-lg border border-[#E5E7EB] hover:border-[#5B4FF9] hover:bg-[#FAFBFF] cursor-pointer transition-all">
              <div className="w-8 h-8 rounded-md bg-[#F3F4F6] flex items-center justify-center"><I.Wallet size={15}/></div>
              <div><p className="text-sm font-semibold text-[#111827]">{m.label}</p><p className="text-xs text-[#9CA3AF]">{m.desc}</p></div>
            </div>
          ))}
          <div className="flex justify-end gap-2 pt-2">
            <Btn variant="secondary" onClick={()=>setShowPayModal(false)}>Cancel</Btn>
            <Btn variant="primary" onClick={()=>setShowPayModal(false)}>Save Payment Method</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD PAGE
// ─────────────────────────────────────────────────────────────────────────────
const DashboardPage = () => {
  const stats = [
    { label:"Today's Revenue", value:fmtNPR(24800), change:12, icon:I.Wallet, color:'#5B4FF9' },
    { label:'Orders Today', value:'18', change:8, icon:I.Bag, color:'#16A34A' },
    { label:'Active Customers', value:'1,204', change:5, icon:I.Users, color:'#2563EB' },
    { label:'Products Live', value:'127', change:-2, icon:I.Box, color:'#D97706' },
  ];
  return (
    <div className="space-y-6">
      <SectionHeader title="Dashboard" subtitle="Welcome back, Aarav 👋"
        actions={<><Btn variant="secondary" size="sm"><I.Cal size={13}/>Apr 2026</Btn><Btn size="sm"><I.DL size={13}/>Export</Btn></>}/>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s=><Stat key={s.label} {...s}/>)}
      </div>
      {/* Mini chart area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 p-5">
          <p className="text-xs font-black uppercase tracking-widest text-[#9CA3AF] mb-4">Revenue Last 7 Days</p>
          <div className="h-40 flex items-end gap-2">
            {[32,48,28,65,55,71,80].map((v,i)=>(
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full rounded-t-md transition-all duration-500" style={{height:`${v*1.6}px`,background:i===6?'#5B4FF9':'#EEF2FF'}}/>
                <span className="text-[9px] text-[#9CA3AF]">{['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i]}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-black uppercase tracking-widest text-[#9CA3AF] mb-4">Order Status</p>
          <div className="space-y-3">
            {[{l:'Delivered',n:312,c:'#16A34A'},{l:'Processing',n:24,c:'#2563EB'},{l:'Pending',n:8,c:'#D97706'},{l:'Cancelled',n:5,c:'#DC2626'}].map(s=>(
              <div key={s.l} className="flex items-center justify-between">
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full" style={{background:s.c}}/><span className="text-xs text-[#374151]">{s.l}</span></div>
                <span className="text-xs font-semibold text-[#111827]">{s.n}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
      {/* Recent orders */}
      <Card>
        <div className="px-5 py-4 border-b border-[#F3F4F6] flex items-center justify-between">
          <p className="text-sm font-bold text-[#111827]">Recent Orders</p>
          <Btn variant="ghost" size="sm">View All <I.CRight size={13}/></Btn>
        </div>
        <Table headers={['Order','Customer','Items','Total','Status','Date']}
          rows={ORDERS.slice(0,5).map(o=>[
            <span className="font-mono text-xs font-semibold text-[#5B4FF9]">{o.id}</span>,
            <div className="flex items-center gap-2"><Avatar name={o.customer} size={24} color="#5B4FF9"/><span className="text-sm">{o.customer}</span></div>,
            <span className="text-xs text-[#6B7280]">{o.items} item{o.items>1?'s':''}</span>,
            <span className="font-mono font-semibold text-[#111827]">{fmtNPR(o.total)}</span>,
            <OrderBadge s={o.status}/>,
            <span className="text-xs text-[#9CA3AF]">{o.date}</span>
          ])}/>
      </Card>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// ORDERS PAGE
// ─────────────────────────────────────────────────────────────────────────────
const OrdersPage = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const filtered = ORDERS.filter(o=>{
    if (statusFilter!=='all' && o.status!==statusFilter) return false;
    if (search && !o.customer.toLowerCase().includes(search.toLowerCase()) && !o.id.includes(search)) return false;
    return true;
  });

  return (
    <div className="space-y-5">
      <SectionHeader title="Orders" subtitle={`${ORDERS.length} total orders`}
        actions={<><Btn variant="secondary" size="sm"><I.DL size={13}/>Export CSV</Btn><Btn size="sm"><I.Plus size={13}/>New Order</Btn></>}/>
      <Card>
        <div className="p-4 border-b border-[#F3F4F6] flex flex-wrap gap-3">
          <Input icon={<I.Search size={14}/>} placeholder="Search orders…" value={search} onChange={e=>setSearch(e.target.value)} className="max-w-xs"/>
          <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}
            className="h-9 rounded-lg border border-[#E5E7EB] bg-white text-sm text-[#374151] px-3 focus:outline-none focus:ring-2 focus:ring-[#5B4FF9]/30">
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <Table headers={['Order ID','Customer','Location','Items','Total','Status','Date','']}
          rows={filtered.map(o=>[
            <span className="font-mono text-xs font-bold text-[#5B4FF9]">{o.id}</span>,
            <div className="flex items-center gap-2"><Avatar name={o.customer} size={26} color="#5B4FF9"/><span className="text-sm font-medium">{o.customer}</span></div>,
            <span className="text-xs text-[#9CA3AF] flex items-center gap-1"><I.MapPin size={11}/>{o.location}</span>,
            <span className="text-xs text-[#6B7280]">{o.items}</span>,
            <span className="font-mono font-semibold text-[#111827] text-sm">{fmtNPR(o.total)}</span>,
            <OrderBadge s={o.status}/>,
            <span className="text-xs text-[#9CA3AF]">{o.date}</span>,
            <button onClick={()=>setSelectedOrder(o)} className="text-[#5B4FF9] hover:text-[#4338CA]"><I.Eye size={15}/></button>
          ])}/>
      </Card>
      {/* Order detail modal */}
      <Modal open={!!selectedOrder} onClose={()=>setSelectedOrder(null)} title={selectedOrder?`Order ${selectedOrder.id}`:''}>
        {selectedOrder && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[['Customer',selectedOrder.customer],['Location',selectedOrder.location],['Items',selectedOrder.items],['Total',fmtNPR(selectedOrder.total)],['Date',selectedOrder.date]].map(([l,v])=>(
                <div key={l}><p className="text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">{l}</p><p className="text-sm font-semibold text-[#111827] mt-0.5">{v}</p></div>
              ))}
              <div><p className="text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">Status</p><div className="mt-0.5"><OrderBadge s={selectedOrder.status}/></div></div>
            </div>
            <div className="pt-3 border-t border-[#F3F4F6] flex gap-2">
              <Btn size="sm" variant="success"><I.CheckC size={13}/>Mark Delivered</Btn>
              <Btn size="sm" variant="secondary"><I.DL size={13}/>Invoice</Btn>
              <Btn size="sm" variant="ghost" className="text-[#DC2626]"><I.Trash size={13}/>Cancel</Btn>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// POS PAGE
// ─────────────────────────────────────────────────────────────────────────────
const POSPage = () => {
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [payMethod, setPayMethod] = useState('cash');
  const [showSuccess, setShowSuccess] = useState(false);

  const addToCart = (product) => {
    setCart(prev => {
      const ex = prev.find(c=>c.id===product.id);
      if (ex) return prev.map(c=>c.id===product.id?{...c,qty:c.qty+1}:c);
      return [...prev, {...product, qty:1}];
    });
  };
  const removeFromCart = (id) => setCart(prev=>prev.filter(c=>c.id!==id));
  const subtotal = cart.reduce((s,c)=>s+c.price*c.qty, 0);
  const tax = Math.round(subtotal*0.13);

  const checkout = () => {
    setCart([]); setShowSuccess(true);
    setTimeout(()=>setShowSuccess(false), 3000);
  };

  const filtered = PRODUCTS.filter(p=>p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="h-[calc(100vh-5rem)] flex gap-4 -m-4 sm:-m-6 md:-m-8 lg:-m-12 p-4 sm:p-6 md:p-8 lg:p-12">
      {showSuccess && <Toast message="Sale completed! Bill printed." type="success" onClose={()=>setShowSuccess(false)}/>}
      {/* Product grid */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex items-center gap-3 mb-4">
          <Input icon={<I.Search size={14}/>} placeholder="Search products…" value={search} onChange={e=>setSearch(e.target.value)} className="flex-1"/>
          <Badge variant="success" className="flex-shrink-0">Session Active</Badge>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 overflow-y-auto flex-1">
          {filtered.map(p=>(
            <button key={p.id} onClick={()=>p.stock>0&&addToCart(p)}
              className={`bg-white rounded-xl border p-3 text-left transition-all hover:border-[#5B4FF9] hover:shadow-md active:scale-[0.97] ${p.stock===0?'opacity-50 cursor-not-allowed':'border-[#E5E7EB]'}`}>
              <div className="w-full h-20 rounded-lg bg-[#F3F4F6] mb-2 flex items-center justify-center">
                <I.Box size={24} style={{color:'#9CA3AF'}}/>
              </div>
              <p className="text-xs font-semibold text-[#111827] truncate">{p.name}</p>
              <p className="text-xs font-black text-[#5B4FF9] mt-0.5">{fmtNPR(p.price)}</p>
              <p className="text-[10px] text-[#9CA3AF] mt-0.5">{p.stock===0?'Out of stock':`${p.stock} left`}</p>
            </button>
          ))}
        </div>
      </div>
      {/* Cart */}
      <div className="w-80 flex-shrink-0 flex flex-col bg-white rounded-xl border border-[#E5E7EB] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[#F3F4F6] flex items-center justify-between">
          <span className="text-sm font-bold text-[#111827]">Cart</span>
          <Badge variant="primary">{cart.length} items</Badge>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {cart.length===0 && <div className="flex flex-col items-center justify-center h-32 text-[#9CA3AF]"><I.Bag size={28}/><p className="text-xs mt-2">Cart is empty</p></div>}
          {cart.map(item=>(
            <div key={item.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-[#F9FAFB]">
              <div className="w-9 h-9 rounded-md bg-[#F3F4F6] flex items-center justify-center flex-shrink-0"><I.Box size={14} style={{color:'#9CA3AF'}}/></div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-[#111827] truncate">{item.name}</p>
                <p className="text-xs text-[#9CA3AF]">{fmtNPR(item.price)} × {item.qty}</p>
              </div>
              <button onClick={()=>removeFromCart(item.id)} className="text-[#DC2626] hover:bg-[#FEE2E2] rounded p-0.5"><I.X size={13}/></button>
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-[#F3F4F6] space-y-3">
          <div className="space-y-1 text-xs">
            <div className="flex justify-between text-[#6B7280]"><span>Subtotal</span><span className="font-mono">{fmtNPR(subtotal)}</span></div>
            <div className="flex justify-between text-[#6B7280]"><span>VAT (13%)</span><span className="font-mono">{fmtNPR(tax)}</span></div>
            <div className="flex justify-between text-[#111827] font-bold text-sm pt-1 border-t border-[#F3F4F6]"><span>Total</span><span className="font-mono text-[#5B4FF9]">{fmtNPR(subtotal+tax)}</span></div>
          </div>
          <div className="grid grid-cols-3 gap-1">
            {['cash','esewa','khalti'].map(m=>(
              <button key={m} onClick={()=>setPayMethod(m)}
                className={`py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wide border transition-all ${payMethod===m?'bg-[#5B4FF9] text-white border-[#5B4FF9]':'bg-white text-[#6B7280] border-[#E5E7EB] hover:border-[#5B4FF9]'}`}>
                {m}
              </button>
            ))}
          </div>
          <Btn variant="primary" size="md" className="w-full justify-center" disabled={cart.length===0} onClick={checkout}>
            <I.Scan size={14}/>Charge {fmtNPR(subtotal+tax)}
          </Btn>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// INVENTORY PAGE
// ─────────────────────────────────────────────────────────────────────────────
const InventoryPage = () => {
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const filtered = PRODUCTS.filter(p=>p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-5">
      <SectionHeader title="Inventory" subtitle="Manage products and stock levels"
        actions={<><Btn variant="secondary" size="sm"><I.DL size={13}/>Export</Btn><Btn size="sm" onClick={()=>setShowAdd(true)}><I.Plus size={13}/>Add Product</Btn></>}/>
      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3">
        {[
          {l:'Total Products',v:'127',icon:I.Box,c:'#5B4FF9'},
          {l:'In Stock',v:'112',icon:I.CheckC,c:'#16A34A'},
          {l:'Low Stock',v:'8',icon:I.Alert,c:'#D97706'},
          {l:'Out of Stock',v:'7',icon:I.X,c:'#DC2626'},
        ].map(s=>(
          <Card key={s.l} className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{background:`${s.c}18`}}>
                <s.icon size={15} style={{color:s.c}}/>
              </div>
              <div><div className="text-lg font-black text-[#111827]">{s.v}</div><div className="text-[10px] text-[#9CA3AF]">{s.l}</div></div>
            </div>
          </Card>
        ))}
      </div>
      <Card>
        <div className="p-4 border-b border-[#F3F4F6] flex gap-3">
          <Input icon={<I.Search size={14}/>} placeholder="Search products…" value={search} onChange={e=>setSearch(e.target.value)} className="max-w-xs"/>
        </div>
        <Table headers={['SKU','Product','Category','Price','Stock','Status','']}
          rows={filtered.map(p=>[
            <span className="font-mono text-xs text-[#9CA3AF]">{p.sku}</span>,
            <span className="text-sm font-medium text-[#111827]">{p.name}</span>,
            <Badge variant="default">{p.category}</Badge>,
            <span className="font-mono font-semibold text-[#111827]">{fmtNPR(p.price)}</span>,
            <span className={`font-mono text-sm font-bold ${p.stock===0?'text-[#DC2626]':p.stock<=5?'text-[#D97706]':'text-[#16A34A]'}`}>{p.stock}</span>,
            <StockBadge s={p.status}/>,
            <div className="flex gap-1"><button className="p-1.5 rounded hover:bg-[#F3F4F6] text-[#6B7280]"><I.Edit size={13}/></button><button className="p-1.5 rounded hover:bg-[#FEE2E2] text-[#9CA3AF] hover:text-[#DC2626]"><I.Trash size={13}/></button></div>
          ])}/>
      </Card>
      <Modal open={showAdd} onClose={()=>setShowAdd(false)} title="Add New Product">
        <div className="space-y-4">
          <Input label="Product Name" placeholder="e.g. Merino Wool Sweater"/>
          <div className="grid grid-cols-2 gap-3">
            <Input label="SKU" placeholder="e.g. MWS-BLK-M"/>
            <Input label="Price (रू)" placeholder="e.g. 3200" type="number"/>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Stock Quantity" placeholder="e.g. 20" type="number"/>
            <Input label="Category" placeholder="e.g. Apparel"/>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Btn variant="secondary" onClick={()=>setShowAdd(false)}>Cancel</Btn>
            <Btn variant="primary" onClick={()=>setShowAdd(false)}>Add Product</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// CUSTOMERS PAGE
// ─────────────────────────────────────────────────────────────────────────────
const CustomersPage = () => {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const filtered = CUSTOMERS.filter(c=>c.name.toLowerCase().includes(search.toLowerCase())||c.email.includes(search));

  return (
    <div className="space-y-5">
      <SectionHeader title="Customers" subtitle={`${CUSTOMERS.length} total customers`}
        actions={<><Btn variant="secondary" size="sm"><I.DL size={13}/>Export</Btn><Btn size="sm"><I.Plus size={13}/>Add Customer</Btn></>}/>
      <Card>
        <div className="p-4 border-b border-[#F3F4F6]">
          <Input icon={<I.Search size={14}/>} placeholder="Search customers…" value={search} onChange={e=>setSearch(e.target.value)} className="max-w-xs"/>
        </div>
        <Table headers={['Customer','Email','Phone','Orders','Total Spent','Since','']}
          rows={filtered.map(c=>[
            <div className="flex items-center gap-2"><Avatar name={c.name} size={28} color="#5B4FF9"/><div><p className="text-sm font-semibold text-[#111827]">{c.name}</p><p className="text-[10px] text-[#9CA3AF]">{c.location}</p></div></div>,
            <span className="text-xs text-[#6B7280]">{c.email}</span>,
            <span className="text-xs text-[#6B7280]">{c.phone}</span>,
            <span className="text-sm font-semibold text-[#374151]">{c.orders}</span>,
            <span className="font-mono text-sm font-semibold text-[#111827]">{fmtNPR(c.spent)}</span>,
            <span className="text-xs text-[#9CA3AF]">{c.since}</span>,
            <button onClick={()=>setSelected(c)} className="text-[#5B4FF9] hover:text-[#4338CA]"><I.Eye size={15}/></button>
          ])}/>
      </Card>
      <Modal open={!!selected} onClose={()=>setSelected(null)} title={selected?.name}>
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[['Email',selected.email],['Phone',selected.phone],['Location',selected.location],['Orders',selected.orders],['Total Spent',fmtNPR(selected.spent)],['Customer Since',selected.since]].map(([l,v])=>(
                <div key={l}><p className="text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">{l}</p><p className="text-sm font-semibold text-[#111827] mt-0.5">{v}</p></div>
              ))}
            </div>
            <div className="flex gap-2 pt-2 border-t border-[#F3F4F6]">
              <Btn size="sm" variant="secondary"><I.Mail size={13}/>Email</Btn>
              <Btn size="sm" variant="secondary"><I.Eye size={13}/>View Orders</Btn>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// ONLINE STORE PAGE
// ─────────────────────────────────────────────────────────────────────────────
const OnlineStorePage = () => (
  <div className="space-y-5">
    <SectionHeader title="Online Store" subtitle="Customize your storefront"
      actions={<><Btn variant="secondary" size="sm"><I.ELink size={13}/>Preview Store</Btn><Btn size="sm"><I.Sparkles size={13}/>Open Builder</Btn></>}/>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[
        {icon:I.Palette,title:'Theme Studio',desc:'Colors, fonts, and visual style for your brand.',action:'Customize'},
        {icon:I.Layers,title:'Page Builder',desc:'Drag-and-drop canvas to design your homepage and landing pages.',action:'Open Builder'},
        {icon:I.Globe,title:'Domain & SEO',desc:'Connect your custom domain and optimize search visibility.',action:'Configure'},
        {icon:I.Menu,title:'Navigation',desc:'Manage header links, menus, and page order.',action:'Edit Nav'},
      ].map(t=>(
        <Card key={t.title} className="p-5 hover:border-[#5B4FF9] transition-colors cursor-pointer group">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] flex items-center justify-center flex-shrink-0 group-hover:bg-[#5B4FF9] transition-colors">
              <t.icon size={18} style={{color:'#5B4FF9'}} className="group-hover:text-white"/>
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-[#111827]">{t.title}</p>
              <p className="text-xs text-[#6B7280] mt-0.5">{t.desc}</p>
              <button className="text-xs font-semibold text-[#5B4FF9] mt-2 hover:underline">{t.action} →</button>
            </div>
          </div>
        </Card>
      ))}
    </div>
    <Card className="p-5">
      <p className="text-xs font-black uppercase tracking-widest text-[#9CA3AF] mb-3">Store Settings</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Store Name" defaultValue="Rare Atelier"/>
        <Input label="Custom Domain" defaultValue="rareatelier.com" icon={<I.Globe size={13}/>}/>
        <Input label="Store Email" defaultValue="hello@rareatelier.com" icon={<I.Mail size={13}/>}/>
        <Input label="Store Phone" defaultValue="+977 98012 34567" icon={<I.Phone size={13}/>}/>
      </div>
      <div className="flex justify-end mt-4"><Btn size="sm">Save Changes</Btn></div>
    </Card>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// STAFF PAGE
// ─────────────────────────────────────────────────────────────────────────────
const StaffPage = () => {
  const [showInvite, setShowInvite] = useState(false);
  return (
    <div className="space-y-5">
      <SectionHeader title="Staff & Roles" subtitle="Manage your team's access"
        actions={<Btn size="sm" onClick={()=>setShowInvite(true)}><I.Plus size={13}/>Invite Staff</Btn>}/>
      <div className="grid grid-cols-3 gap-3 mb-2">
        {[{l:'Total Staff',v:4,c:'#5B4FF9',i:I.Users},{l:'Limit on Plan',v:5,c:'#16A34A',i:I.Shield},{l:'Pending Invites',v:1,c:'#D97706',i:I.Mail}].map(s=>(
          <Card key={s.l} className="p-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{background:`${s.c}18`}}><s.i size={15} style={{color:s.c}}/></div>
            <div><div className="text-xl font-black text-[#111827]">{s.v}</div><div className="text-[10px] text-[#9CA3AF]">{s.l}</div></div>
          </Card>
        ))}
      </div>
      <Card>
        <div className="p-5">
          <p className="text-xs font-black uppercase tracking-widest text-[#9CA3AF] mb-4">Team Members</p>
          <div className="space-y-3">
            {STAFF.map(s=>(
              <div key={s.name} className="flex items-center gap-3 p-3 rounded-xl border border-[#F3F4F6] hover:border-[#E5E7EB]">
                <Avatar name={s.name} size={36} color={s.role==='Owner'?'#5B4FF9':s.role==='Manager'?'#16A34A':'#6B7280'}/>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2"><p className="text-sm font-semibold text-[#111827]">{s.name}</p><Badge variant={s.role==='Owner'?'purple':s.role==='Manager'?'success':'default'}>{s.role}</Badge></div>
                  <p className="text-xs text-[#9CA3AF]">{s.email}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <Badge variant={s.status==='active'?'success':'danger'}>{s.status}</Badge>
                  <p className="text-[10px] text-[#9CA3AF] mt-1">Last login: {s.lastLogin}</p>
                </div>
                {s.role!=='Owner' && <button className="p-1.5 rounded hover:bg-[#F3F4F6] text-[#9CA3AF] hover:text-[#374151]"><I.MV size={14}/></button>}
              </div>
            ))}
          </div>
        </div>
      </Card>
      <Modal open={showInvite} onClose={()=>setShowInvite(false)} title="Invite Team Member">
        <div className="space-y-4">
          <Input label="Email Address" type="email" placeholder="colleague@example.com" icon={<I.Mail size={13}/>}/>
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold text-[#374151] uppercase tracking-wide">Role</label>
            <select className="w-full h-9 rounded-lg border border-[#E5E7EB] bg-white text-sm px-3 focus:outline-none focus:ring-2 focus:ring-[#5B4FF9]/30">
              <option>Admin</option><option>Manager</option><option>Cashier</option><option>CSR</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Btn variant="secondary" onClick={()=>setShowInvite(false)}>Cancel</Btn>
            <Btn variant="primary" onClick={()=>setShowInvite(false)}>Send Invite</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SUPER ADMIN — TENANTS PAGE
// ─────────────────────────────────────────────────────────────────────────────
const SA_TenantsPage = () => {
  const [search, setSearch] = useState('');
  const filtered = SA_TENANTS.filter(t=>t.name.toLowerCase().includes(search.toLowerCase())||t.owner.toLowerCase().includes(search.toLowerCase()));
  const totalMRR = SA_TENANTS.filter(t=>t.status==='active').reduce((s,t)=>s+t.mrr,0);

  return (
    <div className="space-y-5">
      <SectionHeader title="All Stores" subtitle={`${SA_TENANTS.length} tenants on platform`}
        actions={<><Btn variant="secondary" size="sm"><I.DL size={13}/>Export</Btn><Btn size="sm"><I.Plus size={13}/>Create Store</Btn></>}/>
      <div className="grid grid-cols-4 gap-3">
        {[
          {l:'Total Stores',v:SA_TENANTS.length,i:I.Store,c:'#5B4FF9'},
          {l:'Active',v:SA_TENANTS.filter(t=>t.status==='active').length,i:I.CheckC,c:'#16A34A'},
          {l:'On Trial',v:SA_TENANTS.filter(t=>t.status==='trial').length,i:I.Clock,c:'#D97706'},
          {l:'Platform MRR',v:fmtNPR(totalMRR),i:I.Wallet,c:'#7C3AED'},
        ].map(s=>(
          <Card key={s.l} className="p-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{background:`${s.c}18`}}><s.i size={15} style={{color:s.c}}/></div>
            <div><div className="text-lg font-black text-[#111827]">{s.v}</div><div className="text-[10px] text-[#9CA3AF]">{s.l}</div></div>
          </Card>
        ))}
      </div>
      <Card>
        <div className="p-4 border-b border-[#F3F4F6]">
          <Input icon={<I.Search size={14}/>} placeholder="Search stores…" value={search} onChange={e=>setSearch(e.target.value)} className="max-w-xs"/>
        </div>
        <Table headers={['Store','Owner','Plan','Status','MRR','Orders','Since','Actions']}
          rows={filtered.map(t=>[
            <div><p className="text-sm font-semibold text-[#111827]">{t.name}</p><p className="text-[10px] text-[#9CA3AF]">{t.store}</p></div>,
            <span className="text-sm text-[#374151]">{t.owner}</span>,
            <Badge variant={t.plan==='Pro'?'gold':t.plan==='Growth'?'purple':'default'}>{t.plan}</Badge>,
            <TenantBadge s={t.status}/>,
            <span className="font-mono font-semibold text-[#111827]">{t.status==='trial'?'—':fmtNPR(t.mrr)}</span>,
            <span className="text-sm font-semibold text-[#374151]">{t.orders}</span>,
            <span className="text-xs text-[#9CA3AF]">{t.since}</span>,
            <div className="flex gap-1">
              <button className="p-1.5 rounded hover:bg-[#F3F4F6] text-[#6B7280]" title="View Admin"><I.Eye size={13}/></button>
              <button className="p-1.5 rounded hover:bg-[#F3F4F6] text-[#6B7280]" title="Settings"><I.Cog size={13}/></button>
              <button className="p-1.5 rounded hover:bg-[#FEE2E2] text-[#9CA3AF] hover:text-[#DC2626]" title="Suspend"><I.Flag size={13}/></button>
            </div>
          ])}/>
      </Card>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SUPER ADMIN — PLATFORM ANALYTICS
// ─────────────────────────────────────────────────────────────────────────────
const SA_AnalyticsPage = () => (
  <div className="space-y-5">
    <SectionHeader title="Platform Analytics" subtitle="Overview of all stores on Nepalix"/>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[
        {l:'Total GMV (Apr)',v:fmtNPR(8420000),change:18,icon:I.Wallet,color:'#5B4FF9'},
        {l:'Active Stores',v:'5',change:25,icon:I.Store,color:'#16A34A'},
        {l:'Platform MRR',v:fmtNPR(5494),change:12,icon:I.TUp,color:'#7C3AED'},
        {l:'Total Orders',v:'1,976',change:9,icon:I.Bag,color:'#D97706'},
      ].map(s=><Stat key={s.l} {...s}/>)}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card className="p-5">
        <p className="text-xs font-black uppercase tracking-widest text-[#9CA3AF] mb-4">MRR by Plan</p>
        <div className="space-y-3">
          {[{plan:'Pro',count:1,mrr:1999,c:'#D97706'},{plan:'Growth',count:3,mrr:2997,c:'#5B4FF9'},{plan:'Starter',count:2,mrr:998,c:'#6B7280'}].map(p=>(
            <div key={p.plan}>
              <div className="flex justify-between mb-1 text-xs"><span className="font-semibold text-[#374151]">{p.plan} ({p.count} stores)</span><span className="font-mono text-[#111827]">{fmtNPR(p.mrr)}/mo</span></div>
              <ProgressBar value={p.mrr} max={5994} color={p.c}/>
            </div>
          ))}
        </div>
      </Card>
      <Card className="p-5">
        <p className="text-xs font-black uppercase tracking-widest text-[#9CA3AF] mb-4">New Signups (Last 7 Days)</p>
        <div className="h-32 flex items-end gap-2">
          {[0,1,2,0,1,3,1].map((v,i)=>(
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full rounded-t-sm" style={{height:`${Math.max(4,v*32)}px`,background:i===6?'#5B4FF9':'#EEF2FF'}}/>
              <span className="text-[9px] text-[#9CA3AF]">{['M','T','W','T','F','S','S'][i]}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
    <Card>
      <div className="px-5 py-4 border-b border-[#F3F4F6]"><p className="text-sm font-bold text-[#111827]">Top Performing Stores</p></div>
      <Table headers={['Store','Plan','Orders','GMV','Avg. Order']}
        rows={SA_TENANTS.filter(t=>t.orders>0).sort((a,b)=>b.orders-a.orders).map(t=>[
          <span className="text-sm font-semibold text-[#111827]">{t.name}</span>,
          <Badge variant={t.plan==='Pro'?'gold':t.plan==='Growth'?'purple':'default'}>{t.plan}</Badge>,
          <span className="font-semibold text-[#374151]">{t.orders}</span>,
          <span className="font-mono font-semibold text-[#111827]">{fmtNPR(t.orders*2800)}</span>,
          <span className="font-mono text-[#6B7280]">{fmtNPR(2800)}</span>
        ])}/>
    </Card>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// SUPER ADMIN — SUBSCRIPTIONS
// ─────────────────────────────────────────────────────────────────────────────
const SA_SubscriptionsPage = () => (
  <div className="space-y-5">
    <SectionHeader title="Subscriptions" subtitle="Manage all active subscriptions & plans"/>
    <div className="grid grid-cols-4 gap-3">
      {[{l:'Pro Stores',v:1,c:'#D97706'},{l:'Growth Stores',v:3,c:'#5B4FF9'},{l:'Starter Stores',v:2,c:'#6B7280'},{l:'Trials Active',v:1,c:'#16A34A'}].map(s=>(
        <Card key={s.l} className="p-4 text-center">
          <div className="text-2xl font-black" style={{color:s.c}}>{s.v}</div>
          <div className="text-[11px] text-[#9CA3AF] mt-0.5">{s.l}</div>
        </Card>
      ))}
    </div>
    <Card>
      <div className="px-5 py-4 border-b border-[#F3F4F6]"><p className="text-sm font-bold text-[#111827]">All Subscriptions</p></div>
      <Table headers={['Store','Plan','Amount','Next Billing','Status','']}
        rows={SA_TENANTS.map(t=>[
          <span className="text-sm font-semibold text-[#111827]">{t.name}</span>,
          <Badge variant={t.plan==='Pro'?'gold':t.plan==='Growth'?'purple':'default'}>{t.plan}</Badge>,
          <span className="font-mono font-semibold text-[#111827]">{t.status==='trial'?'Free Trial':fmtNPR(t.mrr)+'/mo'}</span>,
          <span className="text-xs text-[#6B7280]">{t.status==='trial'?'Apr 30, 2026':'May 1, 2026'}</span>,
          <TenantBadge s={t.status}/>,
          <div className="flex gap-1">
            <button className="p-1.5 rounded hover:bg-[#F3F4F6] text-[#6B7280]"><I.Edit size={13}/></button>
          </div>
        ])}/>
    </Card>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// SETTINGS PAGE
// ─────────────────────────────────────────────────────────────────────────────
const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('store');
  const tabs = ['store','payments','shipping','notifications','security'];
  return (
    <div className="space-y-5">
      <SectionHeader title="Settings" subtitle="Manage your store configuration"/>
      <div className="flex gap-2 border-b border-[#E5E7EB] pb-0">
        {tabs.map(t=>(
          <button key={t} onClick={()=>setActiveTab(t)}
            className={`px-4 py-2 text-sm font-semibold capitalize transition-all border-b-2 -mb-px ${activeTab===t?'border-[#5B4FF9] text-[#5B4FF9]':'border-transparent text-[#6B7280] hover:text-[#374151]'}`}>
            {t}
          </button>
        ))}
      </div>
      <Card className="p-6">
        {activeTab==='store' && (
          <div className="space-y-4 max-w-xl">
            <Input label="Store Name" defaultValue="Rare Atelier"/>
            <Input label="Store Tagline" defaultValue="Premium Streetwear"/>
            <Input label="Contact Email" defaultValue="hello@rareatelier.com" type="email"/>
            <Input label="Contact Phone" defaultValue="+977 98012 34567"/>
            <Input label="Store Address" defaultValue="Thamel, Kathmandu, Nepal"/>
            <div className="flex justify-end gap-2 pt-2"><Btn variant="secondary">Discard</Btn><Btn>Save Changes</Btn></div>
          </div>
        )}
        {activeTab==='payments' && (
          <div className="space-y-4 max-w-xl">
            <p className="text-xs font-black uppercase tracking-widest text-[#9CA3AF]">Payment Gateways</p>
            {[{n:'eSewa',desc:'Nepal\'s leading digital wallet',enabled:true},{n:'Khalti',desc:'Digital wallet & payments',enabled:true},{n:'FonePay',desc:'QR-based bank payments',enabled:false},{n:'Cash on Delivery',desc:'Accept payment on delivery',enabled:true}].map(g=>(
              <div key={g.n} className="flex items-center justify-between p-3 rounded-xl border border-[#E5E7EB]">
                <div><p className="text-sm font-semibold text-[#111827]">{g.n}</p><p className="text-xs text-[#9CA3AF]">{g.desc}</p></div>
                <div className={`w-10 h-5 rounded-full transition-all cursor-pointer ${g.enabled?'bg-[#5B4FF9]':'bg-[#E5E7EB]'} flex items-center ${g.enabled?'justify-end':'justify-start'} px-0.5`}>
                  <div className="w-4 h-4 rounded-full bg-white shadow-sm"/>
                </div>
              </div>
            ))}
          </div>
        )}
        {(activeTab==='shipping'||activeTab==='notifications'||activeTab==='security') && (
          <div className="text-center py-12 text-[#9CA3AF]">
            <I.Cog size={32} className="mx-auto mb-3 opacity-30"/>
            <p className="text-sm font-medium capitalize">{activeTab} settings coming soon</p>
          </div>
        )}
      </Card>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SA SUPPORT TICKETS
// ─────────────────────────────────────────────────────────────────────────────
const SA_TicketsPage = () => {
  const tickets = [
    {id:'T-091',store:'Himalayan Craft',subject:'Payment not processing',priority:'high',status:'open',time:'2h ago'},
    {id:'T-090',store:'Rare Atelier',subject:'Custom domain not pointing',priority:'medium',status:'resolved',time:'5h ago'},
    {id:'T-089',store:'Kathmandu Threads',subject:'Product images not uploading',priority:'medium',status:'in-progress',time:'1d ago'},
    {id:'T-088',store:'Nepali Nomad',subject:'POS printer setup help',priority:'low',status:'open',time:'2d ago'},
  ];
  return (
    <div className="space-y-5">
      <SectionHeader title="Support Tickets" subtitle="Customer issues across all stores"
        actions={<Badge variant="danger">{tickets.filter(t=>t.status==='open').length} Open</Badge>}/>
      <Card>
        <Table headers={['Ticket','Store','Subject','Priority','Status','Opened']}
          rows={tickets.map(t=>[
            <span className="font-mono text-xs font-bold text-[#5B4FF9]">{t.id}</span>,
            <span className="text-sm font-medium text-[#374151]">{t.store}</span>,
            <span className="text-sm text-[#111827]">{t.subject}</span>,
            <Badge variant={t.priority==='high'?'danger':t.priority==='medium'?'warning':'info'}>{t.priority}</Badge>,
            <Badge variant={t.status==='open'?'danger':t.status==='in-progress'?'warning':'success'}>{t.status}</Badge>,
            <span className="text-xs text-[#9CA3AF]">{t.time}</span>
          ])}/>
      </Card>
    </div>
  );
};

Object.assign(window, {
  BillingPage, DashboardPage, OrdersPage, POSPage, InventoryPage,
  CustomersPage, OnlineStorePage, StaffPage, SettingsPage,
  SA_TenantsPage, SA_AnalyticsPage, SA_SubscriptionsPage, SA_TicketsPage
});
