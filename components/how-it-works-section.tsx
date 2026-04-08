import { Upload, Tag, MessageCircle, Heart } from "lucide-react"

const steps = [
  {
    icon: Upload,
    title: "교환글 올리기",
    description: "교환하고 싶은 굿즈의 사진과 정보를 올려주세요",
    color: "bg-[#FFB7C5]",
  },
  {
    icon: Tag,
    title: "원하는 태그 등록",
    description: "교환받고 싶은 굿즈의 태그를 등록해주세요",
    color: "bg-[#E8A87C]",
  },
  {
    icon: MessageCircle,
    title: "채팅으로 협의",
    description: "관심있는 사용자와 채팅으로 교환 조건을 맞춰요",
    color: "bg-[#F5DCC8]",
  },
  {
    icon: Heart,
    title: "교환 완료",
    description: "합의가 되면 안전하게 교환을 진행해요",
    color: "bg-[#FFB7C5]",
  },
]

export function HowItWorksSection() {
  return (
    <section className="relative overflow-hidden bg-white py-20">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 right-0 h-full" 
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23E8A87C' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-4">
        <div className="mb-14 text-center">
          <h2 className="mb-3 text-3xl font-bold text-[#5D4037]">어떻게 사용하나요?</h2>
          <p className="text-[#8D6E63]">4단계로 간단하게 굿즈를 교환해요</p>
        </div>

        <div className="grid gap-8 md:grid-cols-4">
          {steps.map((step, index) => (
            <div key={step.title} className="relative text-center">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="absolute left-1/2 top-10 hidden h-0.5 w-full bg-gradient-to-r from-[#E8A87C] to-[#FFB7C5] md:block" />
              )}
              
              {/* Step number */}
              <div className="relative mx-auto mb-4">
                <div className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full ${step.color} shadow-lg`}>
                  <step.icon className="h-8 w-8 text-white" />
                </div>
                <div className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-[#5D4037] text-sm font-bold text-white">
                  {index + 1}
                </div>
              </div>

              <h3 className="mb-2 font-semibold text-[#5D4037]">{step.title}</h3>
              <p className="text-sm text-[#8D6E63]">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
