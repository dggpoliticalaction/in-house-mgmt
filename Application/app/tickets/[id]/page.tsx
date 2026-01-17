import { Ticket } from "@/app/components/ticket-utils"
import TicketView from "@/app/components/TicketView"

export default async function TicketInfo({params}: {
  params: Promise<{id: string}>
}) {
  const { id } = await params
  const ticket = await (await fetch(`${process.env.BACKEND_URL}/api/tickets/${id}`)).json() as Ticket
  return (
    <TicketView ticket={ticket}/>
  )
}
