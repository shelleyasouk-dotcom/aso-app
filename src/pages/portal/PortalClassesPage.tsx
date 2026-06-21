import { PortalLayout } from '../../components/layout/PortalLayout'

export function PortalClassesPage() {
  return (
    <PortalLayout>
      <div className="flex flex-col" style={{ height: 'calc(100vh - 64px)' }}>
        {/* Banner */}
        <div className="bg-[#1a3a6b] px-4 py-3 flex items-center justify-between shrink-0">
          <div>
            <p className="text-white font-extrabold text-sm">Book a Class</p>
            <p className="text-white/60 text-xs">Powered by ClassForKids — secure online booking</p>
          </div>
          <a
            href="https://activeschool.classforkids.io"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#f5c518] text-xs font-bold hover:underline shrink-0"
          >
            Open in browser ↗
          </a>
        </div>

        {/* Embedded ClassForKids */}
        <iframe
          src="https://activeschool.classforkids.io"
          title="Book a Class — ClassForKids"
          className="flex-1 w-full border-0"
          allow="payment"
        />
      </div>
    </PortalLayout>
  )
}
