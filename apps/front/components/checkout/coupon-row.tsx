import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Mono } from "@/components/ui/mono";

/** Placeholder honesto: o campo existe, desabilitado, com o aviso do porquê. */
export function CouponRow() {
  return (
    <>
      <div className="mt-5 flex gap-2">
        <Input placeholder="Cupom de desconto" className="max-w-[220px]" disabled />
        <Button variant="outline" disabled>
          Aplicar
        </Button>
      </div>
      <Mono as="div" className="mt-2 text-ink/45">
        Cupons em breve
      </Mono>
    </>
  );
}
