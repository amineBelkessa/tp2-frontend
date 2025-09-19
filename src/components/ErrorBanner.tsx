export default function ErrorBanner({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div style={{padding:12,border:"1px solid #f5c2c7",background:"#f8d7da",color:"#842029",borderRadius:8,margin:"12px 0"}}>
      {message}
    </div>
  );
}
