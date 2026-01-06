import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center px-6 py-12">
      <div className="w-full max-w-lg">
        <Card className="border-border/60 bg-card/80 shadow-sm">
          <CardHeader>
            <CardTitle className="font-display text-3xl">
              Check your inbox
            </CardTitle>
            <CardDescription>
              Confirm your email to activate your account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              We just sent a confirmation link. Once verified, you can jump into
              your dashboard and create your first group.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
